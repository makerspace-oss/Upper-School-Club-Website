import { GoogleAuth } from "google-auth-library";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } =
    process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
    return res
      .status(500)
      .json({ error: "Server misconfigured — missing Google credentials." });
  }

  try {
    // Authenticate with the service account
    const auth = new GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        // Vercel env vars escape newlines as literal \n — restore them
        private_key: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Fetch all rows from Sheet1
    const range = encodeURIComponent("Sheet1");
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[API] Google Sheets error:", response.status, body);
      return res
        .status(502)
        .json({ error: "Failed to fetch data from Google Sheets." });
    }

    const { values } = await response.json();
    if (!values || values.length < 2) {
      return res.json([]);
    }

    // First row = frozen header row, remaining rows = club data.
    // Columns by index:
    //   A (0): Club/Activity Name
    //   B (1): Leadership Structure
    //   C (2): Student Name(s), Specific Role(s)
    //   D (3): Meeting Day
    //   E (4): Description
    //   F (5): Notes
    //   G (6): Tags (comma-separated)
    const clubs = values.slice(1).map((row) => {
      const name = (row[0] ?? "").trim();
      if (!name) return null;
      return {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        Club_Name: name,
        Club_Icon_URL: "",
        Club_Description: (row[4] ?? "").trim(),
        Leadership: (row[1] ?? "").trim(),
        Club_Proctors: (row[2] ?? "").trim(),
        Club_Tags: (row[6] ?? "").trim(),
        Meet_Days: (row[3] ?? "").trim(),
        Notes: (row[5] ?? "").trim(),
        Status: "Active",
      };
    }).filter(Boolean);

    // Cache for 5 minutes on Vercel edge
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(clubs);
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
