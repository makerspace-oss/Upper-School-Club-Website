import { useState, useMemo, useCallback, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { clubs as fallbackClubs, getAllTags } from "./data/clubs";
import { ClubCard } from "./components/ClubCard";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { SchedulePage } from "./pages/SchedulePage";
import { supabase } from "./lib/supabaseClient";
import { fetchClubsFromSheet } from "./lib/googleSheetClient";
import "./App.css";

function getSearchParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function setSearchParam(name, value) {
  const u = new URL(window.location.href);
  if (value) {
    u.searchParams.set(name, value);
  } else {
    u.searchParams.delete(name);
  }
  window.history.replaceState({}, "", u.toString());
}

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [expandedId, setExpandedId] = useState(() => getSearchParam("club") || null);
  const [visibleCount, setVisibleCount] = useState(9);
  const [sheetClubs, setSheetClubs] = useState(null);
  const [remoteClubs, setRemoteClubs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleClubs, setScheduleClubs] = useState([]);

  const location = useLocation();

  const allTags = useMemo(() => getAllTags(), []);

  useEffect(() => {
    if (expandedId) setSearchParam("club", expandedId);
    else setSearchParam("club", "");
  }, [expandedId]);

  // Load clubs from Google Sheets first, then Supabase as a fallback.
  useEffect(() => {
    let isMounted = true;
    async function loadAll() {
      try {
        setLoading(true);
        setError(null);

        // 1) Try Google Sheet (if configured)
        try {
          const sheetData = await fetchClubsFromSheet();
          if (isMounted && sheetData && sheetData.length > 0) {
            setSheetClubs(sheetData);
          }
        } catch (sheetError) {
          console.error("[GoogleSheet] Failed to load clubs", sheetError);
          if (isMounted) {
            setError(
              "Unable to load clubs from Google Sheet. Falling back to other sources."
            );
          }
        }

        // 2) Optionally load from Supabase if a client is configured
        if (supabase) {
          const { data, error: dbError } = await supabase
            .from("clubs")
            .select(
              "id, Club_Name, Club_Icon_URL, Club_Description, Club_Proctors, Club_Tags, Meet_Days, Commitment, Status"
            );
          if (dbError) throw dbError;
          if (!isMounted) return;
          setRemoteClubs(data ?? []);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error("[Data] Failed to load remote clubs", e);
        setError("Unable to load clubs from remote sources. Showing local data instead.");
        setRemoteClubs(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadAll();
    return () => {
      isMounted = false;
    };
  }, []);

  // Reset visible count when search or filters change so the page
  // stays focused and uncluttered.
  useEffect(() => {
    setVisibleCount(9);
  }, [searchQuery, selectedTags]);

  const sourceClubs = useMemo(() => {
    if (sheetClubs && sheetClubs.length > 0) return sheetClubs;
    if (remoteClubs && remoteClubs.length > 0) return remoteClubs;
    return fallbackClubs;
  }, [sheetClubs, remoteClubs]);

  const filteredClubs = useMemo(() => {
    let list = sourceClubs.filter((c) => c.Status === "Active");
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((c) => c.Club_Name.toLowerCase().includes(q));
    }
    if (selectedTags.length > 0) {
      const tagSet = new Set(
        selectedTags.map((t) => t.toLowerCase())
      );
      list = list.filter((c) => {
        const clubTags = (c.Club_Tags || "")
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        return clubTags.some((t) => tagSet.has(t));
      });
    }
    return list;
  }, [searchQuery, selectedTags, sourceClubs]);

  const visibleClubs = useMemo(
    () => filteredClubs.slice(0, visibleCount),
    [filteredClubs, visibleCount]
  );

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleCardToggle = useCallback((clubId) => {
    setExpandedId((prev) => (prev === clubId ? null : clubId));
  }, []);

  const addToSchedule = useCallback((club) => {
    setScheduleClubs((prev) =>
      prev.some((c) => c.id === club.id) ? prev : [...prev, club]
    );
  }, []);

  const removeFromSchedule = useCallback((id) => {
    setScheduleClubs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const scheduleIds = useMemo(
    () => new Set(scheduleClubs.map((c) => c.id)),
    [scheduleClubs]
  );

  return (
    <div className="app">
      <nav className="app-nav">
        <Link
          to="/"
          className={`app-nav__link ${location.pathname === "/" ? "app-nav__link--active" : ""}`}
        >
          Clubs
        </Link>
        <Link
          to="/schedule"
          className={`app-nav__link ${location.pathname === "/schedule" ? "app-nav__link--active" : ""}`}
        >
          Sample Schedule {scheduleClubs.length > 0 && `(${scheduleClubs.length})`}
        </Link>
      </nav>

      <Routes>
        <Route
          path="/schedule"
          element={
            <SchedulePage
              scheduleClubs={scheduleClubs}
              onRemove={removeFromSchedule}
            />
          }
        />
        <Route
          path="/"
          element={
            <>
              <header className="app-header">
                <h1 className="app-title">School Clubs</h1>
                <p className="app-subtitle">
                  Discover clubs, activities, and affinity groups. Click a card to learn more.
                </p>
              </header>

              <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTags={selectedTags}
        allTags={allTags}
        onTagToggle={handleTagToggle}
      />

      <div className="app-results">
        {loading && (
          <p className="app-status">Loading clubs…</p>
        )}
        {error && !loading && (
          <p className="app-status app-status--error">{error}</p>
        )}
        {!loading && filteredClubs.length === 0 ? (
          <p className="app-empty">No clubs match your search or filters.</p>
        ) : (
          <>
            <div className="club-grid" role="list">
              {visibleClubs.map((club) => (
                <div key={club.id} className="club-grid__item" role="listitem">
                  <ClubCard
                    club={club}
                    isExpanded={expandedId === club.id}
                    onToggle={() => handleCardToggle(club.id)}
                    onAddToSchedule={addToSchedule}
                    isOnSchedule={scheduleIds.has(club.id)}
                  />
                </div>
              ))}
            </div>
            {filteredClubs.length > visibleClubs.length && (
              <div className="app-results__more">
                <button
                  type="button"
                  className="app-results__more-button"
                  onClick={() => setVisibleCount(filteredClubs.length)}
                >
                  Show all {filteredClubs.length} clubs
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <footer className="app-footer">
        <p>Centralized club information — year-round access.</p>
      </footer>
            </>
          }
        />
      </Routes>
    </div>
  );
}
