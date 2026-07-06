"""Download the primary FH6 render for every car in data/fh6-cars.csv from the
Forza wiki (https://forza.fandom.com/wiki/Forza_Horizon_6/Cars) and store it in
public/assets/cars/ under a slug derived from the car's Make + Car Name.

Naming convention
-----------------
Each image is stored as ``public/assets/cars/<slug>.<ext>`` where

    slug = slugify(f"{Make} {Car Name}")

and ``slugify`` lower-cases, strips accents (NFKD), and collapses every run of
non-alphanumeric characters to a single hyphen. Because (Make, Car Name) is
unique across the CSV, the slug is a stable, collision-free key that the
frontend can recompute from a car row without any lookup table. The identical
algorithm lives in src/lib/carImages.ts. A manifest of slug -> filename is
written to src/lib/car-images.json so the app can tell which cars have an image
and with which extension.

Resolving the wiki page for a car
---------------------------------
The {{CarListStatsFH6|...}} templates on the Cars page carry, as their first
positional argument, the exact wiki page title (including "(year)"
disambiguation, e.g. "Audi RS 6 Avant (2021)"). We match each CSV row to its
template the same way scripts/add_stats_from_wiki.py does (normalized
year+name, then name-only, disambiguated by PI == Class Rating), then ask the
MediaWiki pageimages API for that page's lead image. Rows that fail to match a
template fall back to the year-stripped Car Name, and titles that return no
lead image fall back to a wiki search.

Usage
-----
    python3 scripts/download_car_images.py [--width 800] [--wikitext cached.json]

The script is idempotent: images already present on disk are skipped, so it can
be re-run to resume after a network interruption.
"""
import argparse
import csv
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

API = "https://forza.fandom.com/api.php"
UA = "fh6-carbrowser/1.0 (educational project; car image fetch)"

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(REPO, "data", "fh6-cars.csv")
IMG_DIR = os.path.join(REPO, "public", "assets", "cars")
MANIFEST_PATH = os.path.join(REPO, "src", "lib", "car-images.json")


# --------------------------------------------------------------------------- #
# Slug + normalization helpers
# --------------------------------------------------------------------------- #
def slugify(text):
    """Filesystem/URL-safe slug. MUST match carImageSlug() in src/lib/carImages.ts."""
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def car_slug(make, name):
    return slugify(f"{make} {name}")


def normalize(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()


# --------------------------------------------------------------------------- #
# MediaWiki API
# --------------------------------------------------------------------------- #
def api_get(params, retries=4):
    params = {**params, "format": "json"}
    url = API + "?" + urllib.parse.urlencode(params)
    last = None
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=45) as resp:
                return json.load(resp)
        except Exception as e:  # noqa: BLE001 - transient network errors
            last = e
            time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"API request failed after {retries} tries: {last}")


def fetch_wikitext():
    data = api_get({
        "action": "parse",
        "page": "Forza_Horizon_6/Cars",
        "prop": "wikitext",
    })
    return data["parse"]["wikitext"]["*"]


# --------------------------------------------------------------------------- #
# Parse the {{CarListStatsFH6}} templates -> (page title, matching keys)
# --------------------------------------------------------------------------- #
def parse_templates(wikitext):
    entries = []
    for m in re.finditer(r"\{\{CarListStatsFH6\|(.*?)\}\}", wikitext):
        fields = m.group(1).split("|")
        positional = []
        for field in fields:
            if re.match(r"^\s*[A-Za-z_]+\s*=", field):  # stop at named params
                break
            positional.append(field)
        while len(positional) < 14:
            positional.append("")
        name = positional[0].strip()       # arg1 == exact wiki page title
        shortname = positional[1].strip()  # arg2 == clean name w/o "(year)"
        year = positional[2].strip()
        pi = positional[12].strip().replace(",", "")
        display = shortname or name
        entries.append({
            "title": name,
            "display": display,
            "year": year,
            "pi": pi,
            "used": False,
        })
    return entries


def build_indexes(entries):
    by_year_name, by_name = {}, {}
    for e in entries:
        by_year_name.setdefault(normalize(f"{e['year']} {e['display']}"), []).append(e)
        by_name.setdefault(normalize(e["display"]), []).append(e)
    return by_year_name, by_name


# Special-edition suffixes whose cars reuse the base car's render on the wiki.
EDITION_RE = re.compile(r"\s+(Welcome Pack|Forza Edition|Hot Wheels)\s*$", re.I)


def strip_year(name):
    return re.sub(r"^\s*\d{4}\s+", "", name.strip())


def candidate_titles(row, primary):
    """Ordered, de-duplicated wiki page titles to try for a car row."""
    name = row["Car Name"].strip()
    cands = []
    for t in (primary, strip_year(name),
              EDITION_RE.sub("", primary), EDITION_RE.sub("", strip_year(name))):
        t = t.strip()
        if t and t not in cands:
            cands.append(t)
    return cands


def find_title(row, by_year_name, by_name):
    """Return the wiki page title for a CSV row, or the year-stripped name."""
    name = row["Car Name"].strip()
    candidates = by_year_name.get(normalize(name), [])
    if not candidates:
        name_no_year = re.sub(r"^\s*\d{4}\s+", "", name)
        candidates = by_name.get(normalize(name_no_year), [])

    entry = None
    if len(candidates) == 1:
        entry = candidates[0]
    elif len(candidates) > 1:
        pi_matches = [c for c in candidates if c["pi"] == row.get("Class Rating", "").strip()]
        unused = [c for c in candidates if not c["used"]]
        if len(pi_matches) == 1:
            entry = pi_matches[0]
        elif len(unused) == 1:
            entry = unused[0]
        else:
            entry = pi_matches[0] if pi_matches else candidates[0]

    if entry:
        entry["used"] = True
        return entry["title"], True
    # Fallback: strip the leading year and hope the page exists.
    return re.sub(r"^\s*\d{4}\s+", "", name), False


# --------------------------------------------------------------------------- #
# pageimages lookups
# --------------------------------------------------------------------------- #
def _resolution_map(query):
    """requested-title -> final-title, following normalized + redirect chains."""
    chain = {}
    for hop in query.get("normalized", []) + query.get("redirects", []):
        chain[hop["from"]] = hop["to"]
    resolved = {}

    def follow(t):
        seen = set()
        while t in chain and t not in seen:
            seen.add(t)
            t = chain[t]
        return t

    return follow


def lookup_images(titles, width):
    """Map each requested title -> lead image URL (or None) via pageimages."""
    result = {}
    uniq = list(dict.fromkeys(titles))
    for i in range(0, len(uniq), 50):
        batch = uniq[i:i + 50]
        data = api_get({
            "action": "query",
            "titles": "|".join(batch),
            "prop": "pageimages",
            "piprop": "thumbnail",
            "pithumbsize": str(width),
            "redirects": "1",
        })
        query = data.get("query", {})
        follow = _resolution_map(query)
        pages = query.get("pages", {})
        by_title = {}
        for p in pages.values():
            src = p.get("thumbnail", {}).get("source")
            if src:
                by_title[p["title"]] = src
        for t in batch:
            result[t] = by_title.get(follow(t))
        time.sleep(0.25)
    return result


def search_image(title, width):
    """Fallback: full-text search the wiki, take the top hit's lead image."""
    data = api_get({
        "action": "query",
        "list": "search",
        "srsearch": title,
        "srlimit": "1",
    })
    hits = data.get("query", {}).get("search", [])
    if not hits:
        return None
    top = hits[0]["title"]
    return lookup_images([top], width).get(top)


# --------------------------------------------------------------------------- #
# Download
# --------------------------------------------------------------------------- #
def sniff_ext(data):
    """Extension from the image's magic bytes. Fandom's thumbnailer serves WebP
    for scaled thumbnails regardless of the source's .png/.jpg URL, so we trust
    the bytes, not the URL."""
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if data[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if data[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    return ".img"


def fetch_bytes(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = resp.read()
            if len(data) < 200:
                raise RuntimeError("suspiciously small image")
            return data
        except Exception:  # noqa: BLE001
            time.sleep(1.5 * (attempt + 1))
    return None


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--width", type=int, default=800, help="thumbnail width in px")
    ap.add_argument("--wikitext", help="path to cached parse-wikitext JSON (optional)")
    args = ap.parse_args()

    os.makedirs(IMG_DIR, exist_ok=True)

    with open(CSV_PATH, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if args.wikitext:
        wikitext = json.load(open(args.wikitext, encoding="utf-8"))["parse"]["wikitext"]["*"]
    else:
        print("Fetching Cars page wikitext ...", file=sys.stderr)
        wikitext = fetch_wikitext()

    entries = parse_templates(wikitext)
    by_year_name, by_name = build_indexes(entries)
    print(f"Parsed {len(entries)} car templates; {len(rows)} CSV rows.", file=sys.stderr)

    # Resolve a page title (and slug) for every row.
    resolved = []
    matched_templates = 0
    for row in rows:
        make, name = row["Make"].strip(), row["Car Name"].strip()
        title, via_template = find_title(row, by_year_name, by_name)
        matched_templates += via_template
        resolved.append({"make": make, "name": name, "slug": car_slug(make, name),
                         "title": title, "via_template": via_template,
                         "candidates": candidate_titles(row, title)})
    print(f"Matched to a wiki template: {matched_templates}/{len(rows)}", file=sys.stderr)

    # Batch pageimages for every candidate title of every row (one flat lookup).
    print("Looking up lead images ...", file=sys.stderr)
    all_titles = [t for r in resolved for t in r["candidates"]]
    img_by_title = lookup_images(all_titles, args.width)

    manifest = {}
    downloaded = skipped = searched = 0
    misses = []

    for idx, r in enumerate(resolved, 1):
        # Already on disk? (resume) — detect any extension for this slug.
        existing = next((fn for fn in os.listdir(IMG_DIR)
                         if os.path.splitext(fn)[0] == r["slug"]
                         and not fn.endswith(".part")), None)
        if existing:
            manifest[r["slug"]] = existing
            skipped += 1
            continue

        url = next((img_by_title[c] for c in r["candidates"] if img_by_title.get(c)), None)
        if not url:
            url = search_image(strip_year(r["name"]), args.width)
            if url:
                searched += 1
        if not url:
            misses.append(f"{r['make']} — {r['name']} (title: {r['title']})")
            continue

        data = fetch_bytes(url)
        if data:
            filename = r["slug"] + sniff_ext(data)
            with open(os.path.join(IMG_DIR, filename), "wb") as f:
                f.write(data)
            manifest[r["slug"]] = filename
            downloaded += 1
            if idx % 25 == 0 or idx == len(resolved):
                print(f"  [{idx}/{len(resolved)}] {downloaded} downloaded, "
                      f"{skipped} cached, {len(misses)} missing", file=sys.stderr)
        else:
            misses.append(f"{r['make']} — {r['name']} (download failed: {url})")
        time.sleep(0.1)

    # Write manifest sorted by slug for stable diffs.
    os.makedirs(os.path.dirname(MANIFEST_PATH), exist_ok=True)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(manifest.items())), f, indent=2, ensure_ascii=False)
        f.write("\n")

    print("\n=== Summary ===", file=sys.stderr)
    print(f"Cars:            {len(rows)}", file=sys.stderr)
    print(f"Images present:  {len(manifest)}  "
          f"(downloaded {downloaded}, cached {skipped}, via search {searched})", file=sys.stderr)
    print(f"Missing:         {len(misses)}", file=sys.stderr)
    print(f"Manifest:        {os.path.relpath(MANIFEST_PATH, REPO)}", file=sys.stderr)
    if misses:
        print("Cars without an image:", file=sys.stderr)
        for m in misses:
            print("  -", m, file=sys.stderr)


if __name__ == "__main__":
    main()
