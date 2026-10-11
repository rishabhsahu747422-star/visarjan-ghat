# Fact check: ten numbers against the PDFs

Owner: E. Everyone verifies their two rows and edits this file.

Ten readings picked across all seven ghats, all three years, both festivals, and all three
statuses (measured, below detection, missing). They include the headline number in the demo
(Bairagarh DO 0) and the number behind decision D-15 (Bairagarh BOD 8.2 a week after immersion).

**Status: nothing verified yet.** Every row below says `checked: no` until a human has opened the
PDF at that page and compared the number. Do not claim a verified fact check in the demo or the
README until this table is filled in.

## How to check a row

1. Download the report for that year from `data/DATA_DICTIONARY.md` → Sources (links below).
2. Open the PDF at the page in the **Page** column. The page number is the PDF page, not a printed
   page number.
3. Find the table row for the site name in **Printed as** (the reports do not use our standard
   names).
4. Compare the value for that phase against **Our value**.
5. Fill in **PDF value** and change **Checked** to `yes` or `no — mismatch`. A mismatch goes
   straight to A, who owns the loader and scoring.

Reports:
- 2025 (92 pages): https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf
- 2024 (118 pages): https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2024.pdf
- 2023 (87 pages): https://www.mppcb.mp.gov.in/proc/mon/Idol_immer._Report_23_CPCB.pdf

The reports print no units. A value matches if the digits match; the unit is ours by assumption.

## The ten

| # | Who | Year | Festival | Ghat (printed as) | Phase | Parameter | Our value | Page | PDF value | Checked | Why this row |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | A | 2023 | Durga | Bairagarh — "Sant Hirdaram visarjan kund,Bairagarh(upper lake),Bhopal" | pre | Dissolved oxygen | 0 | 60 | | no | The headline number of the whole demo. If this is a parser artefact, the demo changes. |
| 2 | A | 2023 | Durga | Bairagarh — same as above | during | Dissolved oxygen | 0 | 60 | | no | Second zero in the same table. Confirms row 1 is not a one-off cell. |
| 3 | B | 2024 | Durga | Bairagarh — "Sant Hirdaram Visarjan Kund, Bairagarh (Upper Lake), Bhopal" | after | BOD | 8.2 | 25 | | no | Decision D-15 rests on it: "no worse than before" while still far above the limit of 3. |
| 4 | B | 2025 | Durga | Shahpura — "Murti-visarjan ghat at Shahpura lake, Bhopal" | pre | Dissolved oxygen | 2.5 | 65 | | no | Rank 2 in the Durga brief quotes it. |
| 5 | C | 2025 | Durga | Rani Kamlapati / Kamla Park — check the printed name on the page | during | Dissolved oxygen | 2.4 | 64 | | no | Rank 3, and the site whose name match we only rate `medium`. Note the exact printed name. |
| 6 | C | 2024 | Ganesh | Hathaikheda — check the printed name on the page | after | BOD | 22 | 71 | | no | The largest BOD in the Bhopal file. An outlier worth confirming. |
| 7 | D | 2023 | Ganesh | Malikhedi — check the printed name on the page | after | BOD | 16.8 | 27 | | no | 1.8 during, 16.8 after. A tenfold jump in one table; confirm it is not a decimal slip. |
| 8 | D | 2025 | Durga | Prempura — check the printed name on the page | after | pH | 8.29 | 65 | | no | Just inside the 6.5–8.5 band. A small parse error would flip it to a breach. |
| 9 | E | 2023 | Ganesh | Khatlapura — check the printed name on the page | pre | Chromium | printed `BDL` | 26 | | no | Must read as "below detection", never 0. Confirm the cell really says BDL. |
| 10 | E | 2023 | Durga | Prempura — check the printed name on the page | during | BOD | printed `_` (missing) | 60 | | no | Must read as missing, never 0 and never "within limits". Confirm the cell is empty. |

## Result

Fill in after checking:

- Rows matching: __ of 10
- Rows mismatching: __ — list them here with what the PDF says.
- Action taken: __

## Already known about the data

From `data/DATA_DICTIONARY.md`, the pack authors spot-checked six tables across the three years
number by number and all matched. Our ten rows are a second, independent check, chosen to cover the
cases where an error would change what the tool tells the officer.
