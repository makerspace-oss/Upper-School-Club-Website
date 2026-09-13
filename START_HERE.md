# START HERE

Quick orientation for the **School Clubs** website: goal, layout, and how to run it.

---

## Goal

A centralized site where students can **discover clubs**, read descriptions, filter by tags, and plan a sample schedule. Data can come from **Google Sheets** (CSV export), **Supabase**, or built-in fallback data. See [README.md](README.md) for full project context.

---

## Codebase Layout

```
├── index.html              # Entry HTML
├── package.json             # Scripts & dependencies
├── vite.config.js           # Vite + React config
├── src/
│   ├── main.jsx             # React root, BrowserRouter
│   ├── App.jsx               # Routes, data loading, filters, club grid
│   ├── App.css
│   ├── index.css
│   ├── components/
│   │   ├── ClubCard.jsx     # Expandable club card (icon, name, tags, description, proctors, meet days)
│   │   └── SearchAndFilter.jsx
│   ├── pages/
│   │   └── SchedulePage.jsx # Sample weekly schedule from “Add to schedule”
│   ├── data/
│   │   └── clubs.js         # GENERATED fallback club list + getAllTags()
│   └── lib/
│       ├── googleSheetClient.js # Calls /api/clubs from the browser
│       └── normalizeClub.js     # Sheet/CSV row → club object (shared by API + import script)
├── api/
│   └── clubs.js             # Vercel function: reads the Google Sheet with a service account
├── scripts/
│   └── import-clubs-csv.mjs # Regenerates src/data/clubs.js from a CSV export
└── README.md
```

---

## Main Pieces

| Piece | Role |
|-------|------|
| **App.jsx** | Loads clubs (Sheet → Supabase → [clubs.js](src/data/clubs.js)), search/filter state, expand state, “Add to schedule,” routes `/` and `/schedule`. |
| **ClubCard** | Collapsed: icon, name, tags. Expanded: + description, proctors, meet days, “Add to schedule.” |
| **SearchAndFilter** | Text search + tag checkboxes; drives filtered list. |
| **SchedulePage** | Shows clubs added to schedule in a Mon–Fri grid (sample layout). |
| **Data** | [src/data/clubs.js](src/data/clubs.js) = fallback. [src/lib/googleSheetClient.js](src/lib/googleSheetClient.js) and [src/lib/supabaseClient.js](src/lib/supabaseClient.js) for optional remote sources. |

---

## How to Run

1. **Install**
   ```bash
   npm install
   ```

2. **Dev server**
   ```bash
   npm run dev
   ```
   Opens at the URL Vite prints (e.g. `http://localhost:5173`).

3. **Build & preview**
   ```bash
   npm run build
   npm run preview
   ```

---

## Club Data

The club list ships **in the bundle**: [src/data/clubs.js](src/data/clubs.js) is generated from a CSV
export of the clubs spreadsheet and is what the site renders. This is the source of truth.

### Updating the clubs

1. In Google Sheets open the **Clubs** tab and choose File → Download → Comma Separated Values (.csv).
2. From the repo root run:
   ```bash
   node scripts/import-clubs-csv.mjs "path/to/Clubs.csv"
   node scripts/verify-clubs-data.mjs "path/to/Clubs.csv"   # field-by-field check, must print ✓
   npm run build
   ```
3. Commit `src/data/clubs.js` and push. Vercel deploys it.

Expected spreadsheet headers (matched by name, so column order does not matter):

`Club Name | Advisor Name | Description | Day (1-10) | Meeting Time (Flex/Long Break) | Major/Minor | Activity Type`

How the columns appear on the site:

| Spreadsheet column | On the site |
|--------------------|-------------|
| Club Name | Card title |
| Advisor Name | "Advisor(s)" in the club dialog |
| Description | Club dialog |
| Day (1-10) | "Meeting Day(s)" as `Day 3, Day 8`; schedule page maps Day 1–5 to Blue week Mon–Fri and Day 6–10 to Green week Mon–Fri |
| Meeting Time | "Meeting Time" in the dialog; schedule page shows Flex Period and Long Break as separate rows, so clubs only overlap within the same slot |
| Major/Minor | "Commitment" in the dialog and a filter tag |
| Activity Type | Filter tags |

### Optional: live Google Sheet

[api/clubs.js](api/clubs.js) can read the sheet directly with a service account, so edits show up without
a redeploy. It is **off by default**. To enable it, share the spreadsheet with `GOOGLE_SERVICE_ACCOUNT_EMAIL`
as a Viewer, set `GOOGLE_SHEET_ID` (and `GOOGLE_SHEET_TAB` if the tab is not named `Clubs`), then set
`VITE_USE_LIVE_SHEET=true` in Vercel and redeploy. If the live fetch fails the bundled data is used.
Both paths go through [src/lib/normalizeClub.js](src/lib/normalizeClub.js), so they produce identical objects.

---

## Routes

| Path | Page |
|------|------|
| `/` | Club directory: search, filter, grid of cards, “Add to schedule.” |
| `/schedule` | Sample schedule of clubs you added. |

---

For detailed process and design notes, see [README.md](README.md).
