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

The site loads clubs in this order:

1. **Live Google Sheet** via `/api/clubs` ([api/clubs.js](api/clubs.js)). The function reads the
   `Clubs` tab (override with `GOOGLE_SHEET_TAB`) of the spreadsheet in `GOOGLE_SHEET_ID` using a
   service account, and caches responses for 5 minutes. Edits to the sheet show up on the site
   automatically; there is nothing to rerun.
2. **Local fallback** ([src/data/clubs.js](src/data/clubs.js)) if the API is unavailable or
   returns no rows.

Both sources go through [src/lib/normalizeClub.js](src/lib/normalizeClub.js), which matches columns
by header name. Expected headers for the 2026-27 sheet:

`Club Name | Advisor Name | Description | Day (1-10) | Meeting Time (Flex/Long Break) | Major/Minor | Activity Type`

Rotation days map onto the schedule page as Day 1–5 = Blue week Mon–Fri, Day 6–10 = Green week Mon–Fri.

### Refreshing the fallback data

Download the sheet tab as CSV (File → Download → CSV) and run:

```bash
node scripts/import-clubs-csv.mjs "path/to/Clubs.csv"
```

This rewrites `src/data/clubs.js`. Commit the result.

---

## Routes

| Path | Page |
|------|------|
| `/` | Club directory: search, filter, grid of cards, “Add to schedule.” |
| `/schedule` | Sample schedule of clubs you added. |

---

For detailed process and design notes, see [README.md](README.md).
