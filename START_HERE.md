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
│   │   └── clubs.js         # Fallback club list + getAllTags()
│   └── lib/
│       ├── supabaseClient.js   # Supabase client (optional; needs env)
│       └── googleSheetClient.js # Fetch clubs from published Sheet CSV (optional)
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

## Optional: Remote Data

- **Google Sheets**  
  Set `VITE_CLUBS_SHEET_URL` to the **published CSV URL** of your sheet (File → Share → Publish to web → CSV).  
  Column names should match the structure in [src/data/clubs.js](src/data/clubs.js) (e.g. `Club_Name`, `Club_Tags`, `Meet_Days`, `Status`, etc.).

- **Supabase**  
  Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. App expects a `clubs` table with columns like `Club_Name`, `Club_Icon_URL`, `Club_Description`, `Club_Proctors`, `Club_Tags`, `Meet_Days`, `Commitment`, `Status`.

If neither is set (or they fail), the app uses the local [src/data/clubs.js](src/data/clubs.js) data.

---

## Routes

| Path | Page |
|------|------|
| `/` | Club directory: search, filter, grid of cards, “Add to schedule.” |
| `/schedule` | Sample schedule of clubs you added. |

---

For detailed process and design notes, see [README.md](README.md).
