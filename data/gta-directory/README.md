# Canada mosque and halal-food data sourcing — GTA first

Checked 2026-10-18T22:18:21.515Z.

No complete, independently verified national registry of both categories was established. The sources below have different purposes; combine them while retaining evidence and source-specific rights. This task does not alter or publish MIC database records.

## Sources

### Canadian Muslim Directory (Islamic Will Registry)

[Canadian Muslim Directory (Islamic Will Registry)](https://islamicwillregistry.com/ilm-hub/directory/directory.json)

Downloadable JSON; 261 operating mosque records in the source; 116 GTA records extracted. Includes source URLs, address/contact fields and source-reported confidence.

Reuse: Licence field points to llms.txt; inspected that page without finding an explicit bulk redistribution grant. Keep as local research pending clarification.

### GTA Masjids

[GTA Masjids](https://gtamasjids.com/)

Volunteer Ontario/GTA mosque directory, useful for checking names and missing locations.

Reuse: No reusable database licence established during review. Use as reference or seek an export agreement.

### HMA

[HMA](https://hmacanada.org/hma-certified-restaurants/)

Certifier index: 50 GTA restaurant/dessert outlets, plus 8 retail outlets. Outlet detail pages link from the index.

Reuse: No bulk reuse licence established. Index presence is not a substitute for checking the current branch certificate, scope and expiry.

### Halal Food Pass

[Halal Food Pass](https://halalfoodpass.ca/canada/)

Broad Canadian restaurant discovery directory, including GTA city pages. Restaurant-supplied halal information, not independent certification. Published counts vary by page date.

Reuse: Commercial directory; no open bulk export licence established. Explore a data partnership rather than assuming unrestricted copying.

### HalalBiz

[HalalBiz](https://www.halalbiz.ca/about)

Canadian mosque/food/business directory with strong GTA coverage. Owner/community halal detail fields.

Reuse: No open bulk export licence established. Potential partner/reference source.

### OpenStreetMap / Overpass

[OpenStreetMap / Overpass](https://wiki.openstreetmap.org/wiki/Overpass_API)

Reusable mosque and explicitly halal-tagged food POIs, IDs, coordinates and optional contact/address tags. Incomplete community coverage. Exact GTA region IDs were resolved, but candidate collection failed (timeouts/HTTP 500).

Reuse: ODbL-1.0: attribution and applicable share-alike requirements. Keep provenance and publish an appropriately licensed derived extract when used.

### Geofabrik Canada

[Geofabrik Canada](https://download.geofabrik.de/north-america/canada.html)

Canadian/provincial OpenStreetMap extracts for a national pipeline; the same OSM coverage limits apply. No large extract downloaded in this task.

Reuse: ODbL-1.0; same attribution/derived-database considerations as OSM.

## GTA research files

- `gta-mosques-research.csv`: 116 source records with contact/address fields where present.
- `gta-hma-restaurants-research.csv`: 50 restaurant/dessert candidates and branch source URLs. Addresses/expiry are not yet checked.
- `gta-hma-food-research.csv`: all 58 HMA index records, including 8 retail outlets.
- `canada-mosques-research.json`: 261 nationwide mosque source records, a starting point for expansion.
- `gta-source-records.json`: detailed provenance for the GTA research records.
- `research-summary.json`: actual record counts and read-only comparison with MIC.
- `summary.json`: failed OSM candidate extraction status, not evidence of zero places. Empty OSM candidates files must not be imported.

These are local research files, not approved public exports. Publisher descriptions, reviews, photographs and personal staff contacts have not been copied into them.

## Coverage

GTA means Toronto, Peel, York, Halton and Durham. GTA research membership is mapped from source city names; this is not a coordinate-based boundary audit. Scarborough, North York and Etobicoke map to Toronto; Thornhill maps to York. [Ontario regional definition](https://www.ontario.ca/page/ontario-population-projections).

| Region | Mosque source records | HMA food outlets, including retail |
|---|---:|---:|
| Toronto | 55 | 25 |
| Peel | 26 | 20 |
| York | 12 | 5 |
| Halton | 10 | 4 |
| Durham | 13 | 4 |

## Existing MIC data and import approach

MIC currently exposes 126 mosque records and 0 business records. 33 GTA source records match an existing mosque name exactly; further records may match under alternate names. Do not treat unmatched names as automatically new.

1. Preserve separate source records and provenance; compare normalized names, branch addresses, official domains and coordinates before merging. Never merge different branches on name alone.
2. Check mosque/restaurant official websites for current address, operating status and public contact details. Queue uncertain/closed/moved places for review.
3. Store halal evidence separately from general listing verification: current certifier certificate, owner declaration, third-party-directory claim, partial menu, or unknown. Record source, date, scope, certifier and expiry when available. Missing information means unknown, never a negative finding.
4. Keep HMA grocery/retail entries separate from restaurants. Include other certifiers and owner-declared restaurants so coverage is not limited to one certification body. Do not infer halal from cuisine, Muslim ownership or a chain name.
5. Use a licensed OSM/partner export or first-party factual verification for publication. Retain OSM attribution and the required licensed extract/method when incorporating OSM data. Do not assume a browsable commercial directory permits cloning.
6. Start with Toronto/Mississauga/Brampton, then remaining Peel, York, Halton and Durham; expand to Ottawa, Hamilton, Waterloo, London, Montreal, Calgary, Edmonton and Metro Vancouver. Existing portal city launch status remains unchanged.

## Reproduce

Local research refresh: `node --env-file=.env.local scripts/prepare-directory-research.mjs`. Licensed OSM extractor: `node --env-file=.env.local scripts/collect-gta-directory.mjs` (public query services were unavailable during this run). Both scripts only read MIC data; neither inserts, updates or deletes database rows. No emails or partnership messages were sent.
