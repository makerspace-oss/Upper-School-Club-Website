const sheetUrl = import.meta.env.VITE_CLUBS_SHEET_URL;

export async function fetchClubsFromSheet() {
  if (!sheetUrl) {
    console.warn(
      "[GoogleSheet] VITE_CLUBS_SHEET_URL not set. Skipping Google Sheet load."
    );
    return null;
  }

  const res = await fetch(sheetUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google Sheet: ${res.status} ${res.statusText}`);
  }

  const text = await res.text();
  const rows = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (rows.length < 2) return [];

  const headers = rows[0].split(",").map((h) => h.trim());
  const dataRows = rows.slice(1);

  return dataRows.map((line) => {
    const cols = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] ?? "").trim();
    });

    return {
      id: row.id || row.Club_Name,
      Club_Name: row.Club_Name,
      Club_Icon_URL: row.Club_Icon_URL,
      Club_Description: row.Club_Description,
      Club_Proctors: row.Club_Proctors,
      Club_Tags: row.Club_Tags,
      Meet_Days: row.Meet_Days,
      Commitment: row.Commitment ?? row.Achievements ?? "",
      Status: row.Status || "Active",
    };
  });
}

