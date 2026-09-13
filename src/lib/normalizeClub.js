/**
 * Convert a raw spreadsheet row into the club shape the app renders.
 *
 * Shared by the Vercel API route (live Google Sheet) and the CSV import
 * script (local fallback data) so both sources produce identical objects.
 *
 * Supported header layouts (matched by header name, case-insensitive):
 *
 *   2026-27 "Clubs" tab:
 *     Club Name | Advisor Name | Description | Day (1-10) |
 *     Meeting Time (Flex/Long Break) | Major/Minor | Activity Type
 *
 *   Legacy "Public Clubs" tab:
 *     Club/Activity Name | Leadership Structure | Student Name(s), Specific Role(s) |
 *     Meeting Day | Description | Notes | Tags
 */

const HEADER_ALIASES = {
  name: ["club name", "club/activity name", "club_name", "name"],
  advisors: ["advisor name", "advisor(s)", "advisors", "advisor"],
  description: ["description", "club_description"],
  days: ["day (1-10)", "day", "days", "meeting day", "meet_days"],
  meetingTime: ["meeting time (flex/long break)", "meeting time", "meeting_time"],
  commitment: ["major/minor", "commitment"],
  activityType: ["activity type", "tags", "club_tags"],
  leadership: ["leadership structure", "leadership"],
  proctors: ["student name(s), specific role(s)", "student leaders", "club_proctors"],
  notes: ["notes"],
  iconUrl: ["club_icon_url", "icon", "icon url"],
};

function normalizeHeader(h) {
  return String(h ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/** Map a header row to { fieldKey: columnIndex }. */
export function buildColumnMap(headerRow) {
  const normalized = headerRow.map(normalizeHeader);
  const map = {};
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.includes(h));
    if (idx !== -1) map[field] = idx;
  }
  return map;
}

export function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

/**
 * "3, 8" -> "Day 3, Day 8". Anything that is not a list of numbers is
 * passed through untouched (e.g. "Monday [Blue]" or "See schedule").
 */
export function formatMeetDays(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  const allNumeric = parts.every((p) => /^\d+$/.test(p));
  if (!allNumeric) return value;
  return parts
    .map(Number)
    .sort((a, b) => a - b)
    .map((n) => `Day ${n}`)
    .join(", ");
}

function splitList(raw) {
  return String(raw ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * @param {string[]} row      A data row (array of cell strings).
 * @param {object}   colMap   Result of buildColumnMap().
 * @returns {object|null}     Club object, or null if the row has no name.
 */
export function rowToClub(row, colMap) {
  const cell = (field) =>
    colMap[field] === undefined ? "" : String(row[colMap[field]] ?? "").trim();

  const name = cell("name");
  if (!name) return null;

  const commitment = capitalize(cell("commitment"));
  const activityTypes = splitList(cell("activityType"));
  const tags = [...activityTypes];
  if (commitment) tags.push(commitment);

  return {
    id: slugify(name),
    Club_Name: name,
    Club_Icon_URL: cell("iconUrl"),
    Club_Description: cell("description"),
    Club_Advisors: cell("advisors"),
    Leadership: cell("leadership"),
    Club_Proctors: cell("proctors"),
    Club_Tags: tags.join(", "),
    Meet_Days: formatMeetDays(cell("days")),
    Meeting_Time: cell("meetingTime"),
    Commitment: commitment,
    Notes: cell("notes"),
    Status: "Active",
  };
}

/** Convert a full sheet (header row + data rows) into club objects. */
export function rowsToClubs(values) {
  if (!values || values.length < 2) return [];
  const colMap = buildColumnMap(values[0]);
  if (colMap.name === undefined) {
    throw new Error(
      `Could not find a club name column in header: ${JSON.stringify(values[0])}`
    );
  }
  return values
    .slice(1)
    .map((row) => rowToClub(row, colMap))
    .filter(Boolean);
}
