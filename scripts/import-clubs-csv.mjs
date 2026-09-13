#!/usr/bin/env node
/**
 * Regenerate src/data/clubs.js (the offline fallback list) from a CSV
 * export of the clubs Google Sheet.
 *
 *   node scripts/import-clubs-csv.mjs "path/to/Clubs.csv"
 *
 * Export the sheet with File → Download → CSV (current tab). The header
 * row is matched by name, so column order does not matter.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { rowsToClubs } from "../src/lib/normalizeClub.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, "../src/data/clubs.js");

/** Minimal RFC 4180 CSV parser (quoted fields, embedded newlines/commas). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      rows.push(row); row = [];
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/import-clubs-csv.mjs <clubs.csv>");
  process.exit(1);
}

const text = readFileSync(resolve(input), "utf8").replace(/^﻿/, "");
const clubs = rowsToClubs(parseCsv(text));

const ids = new Set();
for (const c of clubs) {
  if (ids.has(c.id)) console.warn(`Warning: duplicate id "${c.id}"`);
  ids.add(c.id);
  if (!c.Club_Description) console.warn(`Warning: "${c.Club_Name}" has no description`);
  if (!c.Club_Tags) console.warn(`Warning: "${c.Club_Name}" has no tags`);
}

const banner = `/**
 * Offline fallback club list. GENERATED — do not edit by hand.
 *
 * Regenerate from a CSV export of the clubs Google Sheet:
 *   node scripts/import-clubs-csv.mjs "path/to/Clubs.csv"
 *
 * Source: ${input.split("/").pop()}
 * Generated: ${new Date().toISOString().slice(0, 10)}
 * Clubs: ${clubs.length}
 */
`;

const body =
  "export const clubs = " + JSON.stringify(clubs, null, 2) + ";\n\n" +
  `/** Sorted list of distinct tags across a club list (defaults to the fallback list). */
export function getAllTags(list = clubs) {
  const set = new Set();
  list.forEach((c) => {
    (c.Club_Tags || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((t) => set.add(t));
  });
  return Array.from(set).sort();
}
`;

writeFileSync(OUTPUT, banner + body);
console.log(`Wrote ${clubs.length} clubs to ${OUTPUT}`);
