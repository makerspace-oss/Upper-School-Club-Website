export async function fetchClubsFromSheet() {
  const res = await fetch("/api/clubs");

  if (!res.ok) {
    throw new Error(`Failed to fetch clubs: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
