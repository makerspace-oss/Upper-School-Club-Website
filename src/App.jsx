import { useState, useMemo, useCallback, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { clubs as fallbackClubs, getAllTags } from "./data/clubs";
import { ClubCard } from "./components/ClubCard";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { SchedulePage } from "./pages/SchedulePage";
import { fetchClubsFromSheet } from "./lib/googleSheetClient";
import "./App.css";


export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [sheetClubs, setSheetClubs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleClubs, setScheduleClubs] = useState(() => {
    try {
      const saved = localStorage.getItem("scheduleClubs");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const location = useLocation();
  const navigate = useNavigate();

  const allTags = useMemo(() => getAllTags(), []);

  useEffect(() => {
    localStorage.setItem("scheduleClubs", JSON.stringify(scheduleClubs));
  }, [scheduleClubs]);

  // Load clubs from Google Sheets, fall back to local data.
  useEffect(() => {
    let isMounted = true;
    async function loadClubs() {
      try {
        setLoading(true);
        setError(null);

        const sheetData = await fetchClubsFromSheet();
        if (isMounted && sheetData && sheetData.length > 0) {
          setSheetClubs(sheetData);
        }
      } catch (e) {
        if (!isMounted) return;
        console.error("[GoogleSheet] Failed to load clubs", e);
        setError("Unable to load clubs from Google Sheet. Showing local data instead.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadClubs();
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
    return fallbackClubs;
  }, [sheetClubs]);

  // Decode shared schedule from URL (?s=base64)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get("s");
    if (!encoded || sourceClubs.length === 0) return;
    try {
      const ids = atob(encoded).split(",").filter(Boolean);
      const clubMap = new Map(sourceClubs.map((c) => [c.id, c]));
      const shared = ids.map((id) => clubMap.get(id)).filter(Boolean);
      if (shared.length > 0) {
        setScheduleClubs(shared);
        // Clean the URL param and navigate to schedule
        const url = new URL(window.location.href);
        url.searchParams.delete("s");
        window.history.replaceState({}, "", url.pathname);
        navigate("/schedule");
      }
    } catch (e) {
      console.error("[Share] Failed to decode shared schedule:", e);
    }
  }, [sourceClubs, navigate]);

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
        <Link to="/" className="app-nav__brand">
          <img
            src="https://images.squarespace-cdn.com/content/v1/601586a260bac64bcb51fcdc/1621025263615-E7GTWIJFVTLA16ZMDNP3/Shipley_Inst_H_wTxt_fulclr_RGB+%281%29.png"
            alt="The Shipley School"
            className="app-nav__logo"
          />
        </Link>
        <Link
          to="/"
          className={`app-nav__link ${location.pathname === "/" ? "app-nav__link--active" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          Clubs
        </Link>
        <Link
          to="/schedule"
          className={`app-nav__link ${location.pathname === "/schedule" ? "app-nav__link--active" : ""}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="3" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M1.5 6.5h13M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Schedule {scheduleClubs.length > 0 && `(${scheduleClubs.length})`}
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
              <header className="app-hero">
                <div className="app-hero__overlay" />
                <div className="app-hero__content">
                  <h1 className="app-hero__title">Upper School Clubs & Activities</h1>
                  <p className="app-hero__subtitle">
                    Discover clubs, activities, and affinity groups at Shipley. Click a card to learn more.
                  </p>
                </div>
              </header>

              <div className="app-body">

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

              </div>

              <footer className="app-footer">
                <img
                  src="https://images.squarespace-cdn.com/content/v1/601586a260bac64bcb51fcdc/1621025263615-E7GTWIJFVTLA16ZMDNP3/Shipley_Inst_H_wTxt_fulclr_RGB+%281%29.png"
                  alt="The Shipley School"
                  className="app-footer__logo"
                />
                <p>The Shipley School — Upper School Clubs & Activities</p>
              </footer>
            </>
          }
        />
      </Routes>
    </div>
  );
}
