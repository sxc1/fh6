"""Merge Price/Speed/Handling/Acceleration/Launch/Braking/Offroad stats into
the FH6 car CSV, sourced from the {{CarListStatsFH6}} templates on
https://forza.fandom.com/wiki/Forza_Horizon_6/Cars (fetched via the MediaWiki
API as raw wikitext JSON).

Matching strategy (car names/years differ slightly between forza.net and the
wiki, and some cars share an identical name+year but differ only by PI, e.g.
regular vs. "Welcome Pack"/"Forza Edition" variants):
  1. Try matching on normalized "Year Name" using either the wiki template's
     Name or ShortName field.
  2. If that yields no candidates, relax and match on name only (ignore year).
  3. If multiple candidates remain, disambiguate using the PI value, which
     corresponds exactly to the CSV's "Class Rating" column.

Any wiki entries that can't be matched to an existing CSV row are appended to
the bottom of the CSV as new rows instead of being sorted into place.
"""
import csv
import json
import re
import sys
import unicodedata

WIKI_JSON = sys.argv[1]
CSV_PATH = sys.argv[2]

STAT_FIELDS = ["Price", "Speed", "Handling", "Acceleration", "Launch", "Braking", "Offroad"]


def normalize(s):
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return s.strip()


def clean_number(s):
    s = s.strip()
    if not s or s == "?":
        return ""
    return s.replace(",", "")


with open(WIKI_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)

wikitext = data["parse"]["wikitext"]["*"]

TEMPLATE_RE = re.compile(r"\{\{CarListStatsFH6\|(.*?)\}\}")

wiki_entries = []
for m in TEMPLATE_RE.finditer(wikitext):
    fields = m.group(1).split("|")
    positional = []
    for field in fields:
        if re.match(r"^\s*[A-Za-z_]+\s*=", field):
            break
        positional.append(field)
    while len(positional) < 14:
        positional.append("")
    (name, shortname, year, rarity, value, acquisition,
     sp, ha, ac, la, br, of, pi, country) = positional[:14]

    name = name.strip()
    shortname = shortname.strip()
    year = year.strip()
    display_name = shortname if shortname else name

    wiki_entries.append({
        "name": name,
        "shortname": shortname,
        "display_name": display_name,
        "year": year,
        "pi": clean_number(pi),
        "Price": clean_number(value),
        "Speed": clean_number(sp),
        "Handling": clean_number(ha),
        "Acceleration": clean_number(ac),
        "Launch": clean_number(la),
        "Braking": clean_number(br),
        "Offroad": clean_number(of),
        "used": False,
    })

# Index wiki entries for lookup by "year name" and by "name" alone (both
# Name and ShortName forms map to the same entry).
by_year_name = {}
by_name_only = {}
for e in wiki_entries:
    for text in {e["name"], e["shortname"]}:
        if not text:
            continue
        by_year_name.setdefault(normalize(f"{e['year']} {text}"), []).append(e)
        by_name_only.setdefault(normalize(text), []).append(e)


def dedup(entries):
    seen = set()
    out = []
    for e in entries:
        if id(e) in seen:
            continue
        seen.add(id(e))
        out.append(e)
    return out


def find_candidates(year, car_name):
    # CSV "Car Name" already includes the leading year, matching the
    # "Year Name" form used to build by_year_name.
    key = normalize(car_name)
    candidates = by_year_name.get(key)
    if candidates:
        return dedup(candidates)
    name_without_year = re.sub(r"^\s*\d{4}\s+", "", car_name)
    return dedup(by_name_only.get(normalize(name_without_year), []))


with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

insert_at = fieldnames.index("Class Rating") + 1
new_fieldnames = fieldnames[:insert_at] + STAT_FIELDS + fieldnames[insert_at:]

ambiguous = []
unmatched_rows = []
matched_count = 0

for row in rows:
    candidates = find_candidates(row["Year"], row["Car Name"])
    entry = None
    if len(candidates) == 1:
        entry = candidates[0]
    elif len(candidates) > 1:
        pi_matches = [c for c in candidates if c["pi"] == row["Class Rating"]]
        if len(pi_matches) == 1:
            entry = pi_matches[0]
        else:
            unused = [c for c in candidates if not c["used"]]
            if len(unused) == 1:
                entry = unused[0]
            else:
                ambiguous.append((row["Car Name"], row["Class Rating"], [(c["display_name"], c["pi"]) for c in candidates]))
                entry = pi_matches[0] if pi_matches else candidates[0]

    for field in STAT_FIELDS:
        row[field] = entry[field] if entry else ""

    if entry:
        entry["used"] = True
        matched_count += 1
    else:
        unmatched_rows.append(row["Car Name"])

extra_rows = []
for e in wiki_entries:
    if e["used"]:
        continue
    row = {field: "" for field in new_fieldnames}
    row["Car Name"] = f"{e['year']} {e['display_name']}".strip()
    row["Year"] = e["year"]
    for field in STAT_FIELDS:
        row[field] = e[field]
    extra_rows.append(row)

all_rows = rows + extra_rows

with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=new_fieldnames)
    writer.writeheader()
    writer.writerows(all_rows)

print(f"Total wiki entries parsed: {len(wiki_entries)}")
print(f"CSV rows matched with stats: {matched_count} / {len(rows)}")
print(f"CSV rows with no wiki stats found: {len(unmatched_rows)}")
if unmatched_rows:
    print("Unmatched CSV rows:")
    for n in unmatched_rows:
        print(" -", n)
print(f"Unmatched wiki entries appended as new rows: {len(extra_rows)}")
if extra_rows:
    print("New rows appended:")
    for r in extra_rows:
        print(" -", r["Car Name"])
if ambiguous:
    print(f"Ambiguous matches requiring attention: {len(ambiguous)}")
    for a in ambiguous:
        print(" -", a)
