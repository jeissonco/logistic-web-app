# Spreadsheet schema (the contract)

Human-readable source of truth. Machine version:
[`packages/core/src/sheets/ranges.ts`](../packages/core/src/sheets/ranges.ts) +
[`mapping.ts`](../packages/core/src/sheets/mapping.ts) +
[`runsheet/day-tabs.ts`](../packages/core/src/runsheet/day-tabs.ts).

## Files & tabs

- **One spreadsheet per month.** `SHEET_ID` points at the current month's file and is
  re-pointed each month (manual for now).
- Inside it, **one tab per working day**, named `Ddd DD/MM` — weekday word, space,
  day `/` month, **no year** (`Mon 17/08`, `Fri 21/08`). Mon–Fri. The weekday spelling
  varies (`Thu` and `Thur` both appear) — the parser accepts any length as long as
  the first three letters are a real day.
- The app lists the tabs, keeps only the day-format ones, infers the year (nearest to
  today), maps each to a date. Everything else (`MASTER`, `MOOD tracker`, …) is
  ignored automatically.
- **The app stamps a Stop ID into column Q the first time it reads a tab** — this
  writes to the live spreadsheet (column Q was unused, header `-`).
- `RUNSHEET_TAB` env is an **optional override**: set it to read one fixed tab and
  skip day resolution (single-tab setups, the E2E fixture).

## Row layout (every day tab)

- **Row 7** is the header. Rows 1–6 hidden / a legend. **Data from row 8.**
- Rows with a label in **BUSINESS/NAME** but no **CONTACT #** and no real
  **LOCATION** → **section dividers** (`MORNING TEA` …): shown as headings, never
  actionable, never written.

| Col | Header          | R/W       | Notes                                                     |
| --- | -------------- | --------- | ------------------------------------------------------- |
| A   | INVOICED        | read      | checkbox → boolean                                      |
| B   | JOB             | read      | code *or* full words — see below                        |
| C   | DATE OF REQUEST | read      | raw text: `Monthly` or `24-Aug-2026` (not service date) |
| D   | NOTES/INFO      | read      |                                                       |
| E   | BUSINESS/NAME   | read      | customer; also the divider label                       |
| F   | Unit #          | read      |                                                       |
| G   | LOCATION        | read      | address                                                |
| H   | SUBURB          | read      |                                                       |
| I   | CONTACT #       | read      | phone; sometimes stored as a number (app restores the leading `0` on 9-digit mobiles). Absence marks a divider row |
| J   | BOX SIZE        | read      | planned size (see box sizes)                           |
| K   | QUANT           | read      | planned qty — parsed from text like `One (1)`          |
| L   | DROPPED         | **write** | box size the driver dropped                            |
| M   | # Dropped       | **write** | count dropped                                          |
| N   | PICKED UP       | **write** | box size the driver collected                          |
| O   | # Picked up     | **write** | count collected                                        |
| P   | NOTES           | **write** | driver-editable note (replaces the cell)               |
| Q   | Stop ID         | **write** | **app-managed** — stamped once per row, the write key  |

### Writes

- **Stop ID (Q):** every read stamps `stop_<uuid>` into any actionable row missing
  one (one column update per read). Never edit column Q by hand.
- **Movements (L:O):** a drop / pick-up merges over the existing pair and writes
  `L{row}:O{row}` in place.

### JOB codes (column B)

The cell holds either a short code or the words spelled out; `normalizeJob()` in
[`domain/stop.ts`](../packages/core/src/domain/stop.ts) folds them together.

| Code | Also written as | Meaning    | Badge colour |
| ---- | --------------- | ---------- | ------------ |
| BS   | `Box Swap`      | Box Swap   | orange       |
| DO   | `DROP OFF`      | Drop Off   | purple       |
| CO   | `COLLECTION`    | Collection | yellow       |

Unknown values render grey with the raw text.

### Box sizes (J / L / N)

`boxSizeSchema` in [`schemas/index.ts`](../packages/core/src/schemas/index.ts):
`Small` · `Big` · `100L` · `Corporate` · `240L` · `240L Locked` · `Archive box`.
`parseBoxSize` also accepts `Corp` and is case/whitespace-insensitive.

Drivers can currently **select** only `Small · Big · 100L · Corporate · 240L`
(`SELECTABLE_BOX_SIZES` in [`domain/stop.ts`](../packages/core/src/domain/stop.ts));
`240L Locked` / `Archive box` are read-only for now.

Drivers sometimes write `(nothing)` / `None (0)` in DROPPED/PICKED UP → parsed as
"no movement". Column D (NOTES/INFO) is the office note shown on the stop; column P
is the driver's own editable note.

## Drivers (not in the sheet)

PIN login reads its roster from **`DRIVERS_JSON`** — a JSON array of
`{ driverId, name, pinHash, active }`. `node scripts/hash-pin.mjs <pin> <id> "<name>"`
prints a ready-to-paste line. **Escape the bcrypt `$` as `\$`** — Next's `.env`
loader expands a bare `$abc` inside the hash.
