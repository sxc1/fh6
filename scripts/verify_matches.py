"""Sanity-check: for every CSV row with assigned stats, re-derive which wiki
entry *should* have matched by Price+stat signature, and flag any row whose
Class Rating doesn't correspond to a wiki entry with that same signature.
This catches silent wrong-entry assignments (not just missing matches)."""
import csv
import json
import re
import sys

WIKI_JSON = sys.argv[1]
CSV_PATH = sys.argv[2]

with open(WIKI_JSON, "r", encoding="utf-8") as f:
    data = json.load(f)
wikitext = data["parse"]["wikitext"]["*"]

TEMPLATE_RE = re.compile(r"\{\{CarListStatsFH6\|(.*?)\}\}")
by_pi = {}
for m in TEMPLATE_RE.finditer(wikitext):
    fields = m.group(1).split("|")
    positional = []
    for field in fields:
        if re.match(r"^\s*[A-Za-z_]+\s*=", field):
            break
        positional.append(field)
    while len(positional) < 14:
        positional.append("")
    name, shortname, year, rarity, value, acquisition, sp, ha, ac, la, br, of, pi, country = positional[:14]
    pi = pi.strip()
    if not pi:
        continue
    by_pi.setdefault(pi, []).append({
        "name": (shortname.strip() or name.strip()),
        "year": year.strip(),
        "price": value.strip().replace(",", ""),
        "stats": (sp.strip(), ha.strip(), ac.strip(), la.strip(), br.strip(), of.strip()),
    })

with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
    rows = list(csv.DictReader(f))

mismatches = []
for row in rows:
    if not row.get("Price"):
        continue
    pi = row["Class Rating"]
    candidates = by_pi.get(pi, [])
    row_stats = (row["Speed"], row["Handling"], row["Acceleration"], row["Launch"], row["Braking"], row["Offroad"])
    if not any(c["stats"] == row_stats and c["price"] == row["Price"] for c in candidates):
        mismatches.append((row["Car Name"], row["Class Rating"], row["Price"], row_stats, candidates))

print(f"Checked {sum(1 for r in rows if r.get('Price'))} rows with assigned stats")
print(f"Potential mismatches: {len(mismatches)}")
for name, pi, price, stats, candidates in mismatches:
    print(f" - {name} (Class Rating {pi}, Price {price}, stats {stats})")
    print(f"     wiki candidates for PI {pi}: {candidates}")
