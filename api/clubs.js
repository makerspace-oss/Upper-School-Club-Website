import { GoogleAuth } from "google-auth-library";
import { rowsToClubs } from "../src/lib/normalizeClub.js";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

/** Names of all tabs in a spreadsheet, or [] if the lookup fails. */
async function listSheetTabs(sheetId, accessToken) {
  try {
    const metaUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets.properties.title`;
    const r = await fetch(metaUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (!r.ok) return [];
    const { sheets } = await r.json();
    return (sheets ?? []).map((s) => s.properties?.title).filter(Boolean);
  } catch {
    return [];
  }
}

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

    // Fetch all rows from the clubs tab (default "Clubs"; override with GOOGLE_SHEET_TAB).
    // Tab names with spaces or special chars must be wrapped in single quotes per the Sheets API.
    const tab = process.env.GOOGLE_SHEET_TAB || "Clubs";
    const range = encodeURIComponent(`'${tab.replace(/'/g, "''")}'`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEET_ID}/values/${range}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.token}` },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("[API] Google Sheets error:", response.status, body);
      if (response.status === 400 && /Unable to parse range/i.test(body)) {
        // The tab does not exist in this spreadsheet. Log what tabs it does
        // have so the fix (GOOGLE_SHEET_ID or GOOGLE_SHEET_TAB) is obvious.
        const tabs = await listSheetTabs(GOOGLE_SHEET_ID, token.token);
        console.error(
          `[API] Tab "${tab}" not found in spreadsheet ${GOOGLE_SHEET_ID}. ` +
            `Available tabs: ${tabs.length ? tabs.map((t) => `"${t}"`).join(", ") : "(could not list)"}. ` +
            `Set GOOGLE_SHEET_TAB to one of these, or point GOOGLE_SHEET_ID at the 2026-27 spreadsheet.`
        );
      }
      return res
        .status(502)
        .json({ error: "Failed to fetch data from Google Sheets." });
    }

    const { values } = await response.json();

    // First row = header row (matched by column name, so column order in the
    // sheet does not matter), remaining rows = club data.
    // See src/lib/normalizeClub.js for the supported headers and output shape.
    const clubs = rowsToClubs(values);

    // Cache for 5 minutes on Vercel edge
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");
    return res.status(200).json(clubs);
  } catch (err) {
    console.error("[API] Unexpected error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
