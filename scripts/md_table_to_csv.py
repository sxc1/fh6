"""Convert the FH6 car list markdown table into a CSV file.

Source table columns: Make, Car Name, Car Type, Car Class, Country, Collection, Add-Ons
Output adds a "Year" column (parsed from Car Name) and splits "Car Class"
(e.g. "100 D", "734 S1") into "Car Class" (letter rating) and "Class Rating" (number).
"""
import csv
import re
import sys

SRC = sys.argv[1]
DST = sys.argv[2]

rows = []
header = None

with open(SRC, "r", encoding="utf-8") as f:
    for line in f:
        stripped = line.rstrip("\n").strip()
        if not stripped.startswith("|"):
            continue
        cells = [c.strip() for c in stripped.strip("|").split("|")]
        if all(re.fullmatch(r":?-+:?", c) for c in cells):
            continue  # markdown separator row like |---|---|
        cells = [re.sub(r"\s+", " ", c).strip() for c in cells]
        if header is None:
            header = cells
            continue
        if len(cells) != len(header):
            if len(cells) < len(header):
                cells += [""] * (len(header) - len(cells))
            else:
                cells = cells[: len(header)]
        rows.append(cells)

NAME_IDX = header.index("Car Name")
CLASS_IDX = header.index("Car Class")

YEAR_RE = re.compile(r"^(\d{4})\b")
CLASS_RE = re.compile(r"^(\d+)\s*([A-Z0-9]+)$")

out_header = header[:NAME_IDX + 1] + ["Year"] + header[NAME_IDX + 1:CLASS_IDX + 1] + ["Class Rating"] + header[CLASS_IDX + 1:]

out_rows = []
for cells in rows:
    year_match = YEAR_RE.match(cells[NAME_IDX])
    year = year_match.group(1) if year_match else ""

    class_value = cells[CLASS_IDX]
    class_match = CLASS_RE.match(class_value)
    if class_match:
        rating, letter = class_match.groups()
    else:
        rating, letter = "", class_value

    new_cells = (
        cells[:NAME_IDX + 1]
        + [year]
        + cells[NAME_IDX + 1:CLASS_IDX]
        + [letter, rating]
        + cells[CLASS_IDX + 1:]
    )
    out_rows.append(new_cells)

with open(DST, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(out_header)
    writer.writerows(out_rows)

print(f"Wrote {len(out_rows)} rows with header {out_header} to {DST}")
