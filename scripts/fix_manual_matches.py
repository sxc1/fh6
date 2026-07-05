"""Apply manually-verified corrections after add_stats_from_wiki.py:

1. Overwrite stats for CSV rows whose name/year differs slightly from the
   wiki (Welcome Pack / Forza Edition / minor spelling differences) - these
   were incorrectly left blank or, in two cases, silently given the WRONG
   variant's stats because the wiki lists the same name twice under
   different years.
2. Remove the now-redundant appended duplicate rows.
3. Enrich the 5 genuinely-new "Touge Edition" unobtainable cars with
   Make/Country/Collection instead of leaving them sparse.
"""
import csv

CSV_PATH = "data/fh6-cars.csv"
STAT_FIELDS = ["Price", "Speed", "Handling", "Acceleration", "Launch", "Braking", "Offroad"]

# Car Name -> corrected stats (verified against the wiki's raw wikitext)
CORRECTIONS = {
    "2021 BMW M4 Competition Coupé Welcome Pack": ("150000", "7.7", "7.1", "6.1", "6.6", "6.8", "4.8"),
    "2018 Ferrari FXX-K Evo Welcome Pack": ("250000", "8.1", "9.4", "8.7", "9.4", "10", "4.9"),
    "2023 Ford F-150 Raptor R Welcome Pack": ("50000", "6.2", "3.4", "7.3", "6.8", "4.3", "9.7"),
    "2017 Ford #14 Rahal Letterman Lanigan Racing Fiesta": ("150000", "5.0", "5.4", "9.2", "10", "5.8", "7.9"),
    "2006 Formula Drift #43 Dodge Viper SRT-10 ACR": ("250000", "7.3", "5.1", "5.3", "5.6", "4.9", "4.0"),
    "2008 Honda Civic Type R (FD2)": ("20000", "5.7", "4.6", "4.2", "4.3", "3.7", "5.3"),
    "2019 Jimco #240 Fastball Racing Class 6100 Spec Trophy Truck": ("350000", "4.5", "2.9", "3.8", "2.9", "5.2", "9.3"),
    # Wiki mislabels this car's year as 2021 (forza.net says 2020); Class
    # Rating 782 disambiguates it from the Welcome Pack variant below.
    "2020 Mercedes-AMG GT Black Series": ("440000", "7.4", "7.1", "6.5", "6.2", "8.4", "4.7"),
    "2020 Mercedes-AMG GT Black Series Welcome Pack": ("200000", "7.4", "8.9", "7.8", "8.6", "10", "4.7"),
    "1990 Mercedes-Benz 190 E 2.5-16 Evolution II": ("200000", "6.2", "4.4", "4.0", "3.6", "2.9", "4.8"),
    "1990 Mercedes-Benz 190 E 2.5-16 Evolution II Forza Edition": ("750000", "6.3", "7.3", "4.8", "3.8", "6.3", "5.0"),
    "2004 Mitsubishi Lancer Evolution VIII MR Welcome Pack": ("100000", "6.9", "6.5", "7.7", "4.1", "5.1", "6.9"),
    # Was incorrectly given the Forza Edition's stats; this is the base car.
    "1970 Porsche #3 917 LH": ("1000000", "8.2", "5.2", "7.2", "7.1", "4.9", "4.5"),
    "2022 Subaru BRZ Forza Edition": ("500000", "7.6", "4.3", "7.7", "7.0", "4.3", "10"),
    "2017 Volkswagen #34 Andretti Rally Cross Beetle": ("150000", "4.8", "5.3", "9.2", "4.6", "5.9", "7.8"),
}

# These appended rows are now redundant (folded into CORRECTIONS above).
REDUNDANT_APPENDED_NAMES = {
    "2021 BMW M4 Competition Coupé",
    "2018 Ferrari FXX-K Evo",
    "2023 Ford F-150 Raptor R",
    "2017 Ford #14 Rahal Letterman Lanigan Racing GRC Fiesta",
    "2006 Formula Drift #43 Dodge Viper SRT10",
    "2008 Honda Civic Type R",
    "2019 Jimco #240 Fastball Racing Spec Trophy Truck",
    "2021 Mercedes-AMG GT Black Series",
    "1990 Mercedes-Benz 190E 2.5-16 Evolution II",
    "2004 Mitsubishi Lancer Evolution VIII MR",
    "2022 Subaru BRZ",
    "2017 Volkswagen #34 Volkswagen Andretti Rally Cross Beetle",
    "1970 Porsche #3 917 LH",
}

# Genuinely new cars (wiki "Unobtainable" section) not present in the
# forza.net-sourced list at all - enrich rather than leave sparse.
TOUGE_EDITION_INFO = {
    "2003 Honda S2000 'Touge Edition'": ("Honda", "Japan"),
    "1994 Honda Acty 'RakuRaku Express'": ("Honda", "Japan"),
    "2012 Nissan GT-R Black Edition (R35) 'Touge Edition'": ("Nissan", "Japan"),
    "1998 Subaru Impreza 22B-STi Version 'Touge Edition'": ("Subaru", "Japan"),
    "1985 Toyota Sprinter Trueno GT Apex 'Touge Edition'": ("Toyota", "Japan"),
}

with open(CSV_PATH, "r", encoding="utf-8", newline="") as f:
    reader = csv.DictReader(f)
    fieldnames = reader.fieldnames
    rows = list(reader)

output_rows = []
redundant_removed = 0
duplicate_190e_seen = 0
corrections_applied = set()

for row in rows:
    name = row["Car Name"]

    if name in REDUNDANT_APPENDED_NAMES and not row["Make"]:
        # This is an appended (sparse) duplicate row - drop it.
        redundant_removed += 1
        continue

    if name == "1990 Mercedes-Benz 190E 2.5-16 Evolution II" and not row["Make"]:
        # Two appended rows share this exact name (regular + Forza Edition
        # variant); both were folded into CORRECTIONS via the real rows, so
        # drop both appended copies.
        redundant_removed += 1
        continue

    if name in CORRECTIONS and row["Make"]:
        price, sp, ha, ac, la, br, of = CORRECTIONS[name]
        row["Price"], row["Speed"], row["Handling"], row["Acceleration"], row["Launch"], row["Braking"], row["Offroad"] = (
            price, sp, ha, ac, la, br, of,
        )
        corrections_applied.add(name)

    if name in TOUGE_EDITION_INFO:
        make, country = TOUGE_EDITION_INFO[name]
        row["Make"] = make
        row["Country"] = country
        row["Collection"] = "Unobtainable"

    output_rows.append(row)

with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(output_rows)

print(f"Redundant appended rows removed: {redundant_removed}")
print(f"Corrections applied: {len(corrections_applied)} / {len(CORRECTIONS)}")
missing = set(CORRECTIONS) - corrections_applied
if missing:
    print("WARNING - corrections not applied (name not found):")
    for m in missing:
        print(" -", m)
print(f"Final row count: {len(output_rows)}")
