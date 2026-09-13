#!/usr/bin/env node
/**
 * Verify src/data/clubs.js against a CSV export of the spreadsheet,
 * field by field. Exits non-zero on any mismatch.
 *
 *   node scripts/verify-clubs-data.mjs "path/to/Clubs.csv"
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { clubs } from "../src/data/clubs.js";

function parseCsv(text) {
  const rows = []; let row = []; let field = ""; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += ch; }
    else if (ch === '"') q = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(field); field = ""; rows.push(row); row = []; }
    else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const input = process.argv[2];
if (!input) { console.error("Usage: node scripts/verify-clubs-data.mjs <clubs.csv>"); process.exit(1); }
const rows = parseCsv(readFileSync(resolve(input), "utf8").replace(/^﻿/, ""));
const header = rows[0];
const col = (name) => header.indexOf(name);
const expectedHeader = ["Club Name", "Advisor Name", "Description", "Day (1-10)", "Meeting Time (Flex/Long Break)", "Major/Minor", "Activity Type"];

const problems = [];
if (JSON.stringify(header) !== JSON.stringify(expectedHeader)) problems.push(`Unexpected header: ${JSON.stringify(header)}`);

const data = rows.slice(1).filter((r) => (r[col("Club Name")] ?? "").trim());
if (data.length !== clubs.length) problems.push(`Row count: CSV has ${data.length}, clubs.js has ${clubs.length}`);

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : "");
const fmtDays = (raw) => raw.split(",").map((p) => p.trim()).filter(Boolean).map(Number).sort((a, b) => a - b).map((n) => `Day ${n}`).join(", ");

data.forEach((r, i) => {
  const c = clubs[i];
  const name = r[col("Club Name")];
  if (!c) { problems.push(`Missing club at index ${i}: ${name}`); return; }
  const expected = {
    Club_Name: name,
    Club_Advisors: r[col("Advisor Name")],
    Club_Description: r[col("Description")],
    Meet_Days: fmtDays(r[col("Day (1-10)")]),
    Meeting_Time: r[col("Meeting Time (Flex/Long Break)")],
    Commitment: cap(r[col("Major/Minor")]),
    Club_Tags: [...r[col("Activity Type")].split(",").map((t) => t.trim()).filter(Boolean), cap(r[col("Major/Minor")])].filter(Boolean).join(", "),
    Status: "Active",
  };
  for (const [k, v] of Object.entries(expected)) {
    if (c[k] !== v) problems.push(`${name} → ${k}\n    CSV:  ${JSON.stringify(v)}\n    site: ${JSON.stringify(c[k])}`);
  }
  // Order in clubs.js must match the spreadsheet.
  if (c.Club_Name !== name) problems.push(`Order mismatch at row ${i + 2}: CSV "${name}" vs site "${c.Club_Name}"`);
});

const ids = new Set();
for (const c of clubs) { if (ids.has(c.id)) problems.push(`Duplicate id: ${c.id}`); ids.add(c.id); }

if (problems.length) {
  console.error(`✗ ${problems.length} problem(s):\n` + problems.map((p) => "  - " + p).join("\n"));
  process.exit(1);
}
console.log(`✓ ${clubs.length} clubs match the spreadsheet field-for-field (name, advisor, description, days, meeting time, major/minor, activity type, order).`);
