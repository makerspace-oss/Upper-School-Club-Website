import { useMemo, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { ClubModal } from "../components/ClubCard";
import "./SchedulePage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};

const TIME_SLOTS = [
  { label: "10:00 – 10:25 AM", start: 10, duration: 25, period: "morning" },
  { label: "3:30 – 4:20 PM", start: 15.5, duration: 50, period: "afternoon" },
];

/**
 * Parse Meet_Days like "Monday [Blue], Wednesday [Green]"
 * into [{ day: "Mon", week: "Blue" }, { day: "Wed", week: "Green" }]
 */
function parseMeetDays(meetDays) {
  if (!meetDays) return [];
  return meetDays
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((entry) => {
      const weekMatch = entry.match(/\[(blue|green)\]/i);
      const week = weekMatch
        ? weekMatch[1].charAt(0).toUpperCase() + weekMatch[1].slice(1).toLowerCase()
        : null;
      const dayPart = entry.replace(/\[.*?\]/g, "").trim().toLowerCase();
      const day = DAY_FULL[dayPart] || null;
      return { day, week };
    })
    .filter((e) => e.day);
}

/** Check which weeks a club appears in */
function getClubWeeks(club) {
  const parsed = parseMeetDays(club.Meet_Days);
  const weeks = new Set();
  parsed.forEach(({ week }) => {
    if (week) weeks.add(week);
  });
  if (weeks.size === 0) {
    weeks.add("Blue");
    weeks.add("Green");
  }
  return Array.from(weeks);
}

/** Build a grid map: key = "dayIdx-slotIdx" -> [clubs] */
function buildWeekGrid(clubs, weekType) {
  const grid = {};
  clubs.forEach((club) => {
    const parsed = parseMeetDays(club.Meet_Days);
    if (parsed.length === 0) {
      // No parseable days — place in Monday afternoon for both weeks
      const key = "0-1";
      if (!grid[key]) grid[key] = [];
      if (!grid[key].some((c) => c.id === club.id)) grid[key].push(club);
      return;
    }
    parsed.forEach(({ day, week }) => {
      if (week && week !== weekType) return;
      if (!week) {
        // No week specified — include in both
      }
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;
      // Default to afternoon slot
      const slotIdx = 1;
      const key = `${dayIdx}-${slotIdx}`;
      if (!grid[key]) grid[key] = [];
      if (!grid[key].some((c) => c.id === club.id)) grid[key].push(club);
    });
  });
  return grid;
}

/** Find overlaps: cells with more than one club */
function findOverlaps(grid) {
  const overlaps = [];
  Object.entries(grid).forEach(([key, clubs]) => {
    if (clubs.length > 1) {
      const [dayIdx, slotIdx] = key.split("-").map(Number);
      overlaps.push({ dayIdx, slotIdx, clubs, key });
    }
  });
  return overlaps;
}

/** Find other clubs that meet on a specific day+week */
function findAlternatives(allClubs, scheduleIds, day, weekType) {
  return allClubs.filter((club) => {
    if (scheduleIds.has(club.id)) return false;
    if (club.Status !== "Active") return false;
    const parsed = parseMeetDays(club.Meet_Days);
    return parsed.some((p) => {
      if (p.day !== day) return false;
      if (p.week && p.week !== weekType) return false;
      return true;
    });
  });
}

/* ─── Overlap Modal ─── */
function OverlapModal({ club, currentDay, weekType, freeDays, alternatives, onMove, onSwap, onRemove, onView, onClose }) {
  return (
    <div className="replace-modal__backdrop" onClick={onClose}>
      <div className="replace-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="replace-modal__close" onClick={onClose}>
          &times;
        </button>
        <h3 className="replace-modal__title">Replace {club.Club_Name}</h3>
        <p className="replace-modal__subtitle">
          {day} &middot; {weekType} Week
        </p>
        {isMultiWeek && (
          <p className="replace-modal__warning">
            This club meets in both {clubWeeks.join(" and ")} weeks.
            Replacing it will remove it from all weeks.
          </p>
        )}

        {alternatives.length > 0 && (
          <div className="replace-modal__section">
            <p className="replace-modal__hint">Or swap for a different club:</p>
            <ul className="replace-modal__list">
              {alternatives.slice(0, 5).map((alt) => (
                <li key={alt.id} className="replace-modal__item">
                  <div className="replace-modal__item-info">
                    <span className="replace-modal__item-name">{alt.Club_Name}</span>
                    <span className="replace-modal__item-days">{alt.Meet_Days || "See schedule"}</span>
                  </div>
                  <div className="replace-modal__item-actions">
                    <button
                      type="button"
                      className="replace-modal__item-icon-btn"
                      onClick={() => onView(alt)}
                      aria-label={`View details for ${alt.Club_Name}`}
                      title="View details"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8c1.5-3 4-5 7-5s5.5 2 7 5c-1.5 3-4 5-7 5s-5.5-2-7-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </button>
                    <button type="button" className="replace-modal__item-btn" onClick={() => onSwap(club.id, alt)}>Swap</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Week Grid ─── */
function WeekGrid({ weekType, clubs, allClubs, scheduleIds, onRemove, onReplace, color }) {
  const [modalClub, setModalClub] = useState(null);
  const [modalDayIdx, setModalDayIdx] = useState(null);
  const [viewClub, setViewClub] = useState(null);

  const grid = useMemo(() => buildWeekGrid(clubs, weekType), [clubs, weekType]);
  const overlaps = useMemo(() => findOverlaps(grid), [grid]);
  const overlapKeys = useMemo(() => new Set(overlaps.map((o) => o.key)), [overlaps]);

  const getClubs = (dayIdx, slotIdx) => grid[`${dayIdx}-${slotIdx}`] || [];

  const handleEventClick = (club, dayIdx) => {
    setModalClub(club);
    setModalDay(DAYS[dayIdx]);
  };

  const alternatives = useMemo(() => {
    if (!modalClub || !modalDay) return [];
    return findAlternatives(allClubs, scheduleIds, modalDay, weekType);
  }, [modalClub, modalDay, allClubs, scheduleIds, weekType]);

  return (
    <div className={`week-grid week-grid--${weekType.toLowerCase()}`}>
      <div className="week-grid__header" style={{ background: color }}>
        <span className="week-grid__header-label">{weekType} Week</span>
      </div>

      <div className="week-grid__days">
        {DAYS.map((day, dayIdx) => {
          const dayClubs = grid[dayIdx] || [];
          const hasOverlap = overlapDays.has(dayIdx);
          return (
            <div key={day} className={`week-grid__day${hasOverlap ? " week-grid__day--overlap" : ""}`}>
              <div className="week-grid__day-label" style={{ background: color }}>{day}</div>
              <div className="week-grid__day-clubs">
                {dayClubs.length === 0 && (
                  <span className="week-grid__day-empty">—</span>
                )}
                {dayClubs.map((club) => (
                  <div
                    key={club.id}
                    className={`week-grid__event${hasOverlap ? " week-grid__event--overlap" : ""}`}
                    style={{ borderLeftColor: color, cursor: hasOverlap ? "pointer" : "default" }}
                    onClick={hasOverlap ? () => { setModalClub(club); setModalDayIdx(dayIdx); } : undefined}
                    title={hasOverlap ? "Click to resolve overlap" : club.Club_Name}
                  >
                    <span className="week-grid__event-time">Flex</span>
                    <span className="week-grid__event-name">{club.Club_Name}</span>
                    <button
                      type="button"
                      className="week-grid__event-remove"
                      onClick={(e) => { e.stopPropagation(); onRemove(club.id); }}
                      aria-label={`Remove ${club.Club_Name}`}
                    >&times;</button>
                  </div>
                ))}
              </div>
            </div>
            {DAYS.map((_, dayIdx) => {
              const cellClubs = getClubs(dayIdx, slotIdx);
              const cellKey = `${dayIdx}-${slotIdx}`;
              const hasOverlap = overlapKeys.has(cellKey);
              return (
                <div
                  key={cellKey}
                  className={`week-grid__cell${hasOverlap ? " week-grid__cell--overlap" : ""}`}
                >
                  {cellClubs.map((club) => (
                    <div
                      key={club.id}
                      className="week-grid__event"
                      style={{ borderLeftColor: color, cursor: "pointer" }}
                      onClick={() => handleEventClick(club, dayIdx)}
                      title="Click to replace this club"
                    >
                      <span className="week-grid__event-name">{club.Club_Name}</span>
                      <button
                        type="button"
                        className="week-grid__event-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(club.id);
                        }}
                        aria-label={`Remove ${club.Club_Name}`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modalClub && modalDay && (
        <ReplaceModal
          club={modalClub}
          day={modalDay}
          weekType={weekType}
          alternatives={alternatives}
          onMove={(id, wk, di) => { onMoveDay(id, wk, di); setModalClub(null); setModalDayIdx(null); }}
          onSwap={(id, nc) => { onSwap(id, nc); setModalClub(null); setModalDayIdx(null); }}
          onRemove={onRemove}
          onView={(c) => setViewClub(c)}
          onClose={() => { setModalClub(null); setModalDayIdx(null); }}
        />
      )}

      {viewClub && (
        <ClubModal
          club={viewClub}
          isOnSchedule={scheduleIds.has(viewClub.id)}
          onClose={() => setViewClub(null)}
        />
      )}
    </div>
  );
}

/* ─── Schedule Page ─── */
export function SchedulePage({ scheduleClubs, allClubs = [], onRemove, onAdd }) {
  const scheduleRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  const scheduleIds = useMemo(
    () => new Set(scheduleClubs.map((c) => c.id)),
    [scheduleClubs]
  );

  const handleReplace = useCallback(
    (oldId, newClub) => {
      onRemove(oldId);
      onAdd(newClub);
    },
    [onRemove, onAdd]
  );

  const handleExport = useCallback(async () => {
    if (!scheduleRef.current) return;
    try {
      const el = scheduleRef.current;

      // Save original inline style; force a fixed render width so nothing wraps differently or clips
      const prevStyle = el.getAttribute("style") || "";
      const prevTransform = el.style.transform;

      el.style.width = "1100px";
      el.style.maxWidth = "1100px";
      el.style.padding = "24px";
      el.style.background = "#f7f8fa";
      el.style.borderRadius = "0";

      // Hide remove buttons in the export
      const removeBtns = Array.from(el.querySelectorAll(".week-grid__event-remove"));
      removeBtns.forEach((b) => { b.dataset.prevDisplay = b.style.display; b.style.display = "none"; });

      // Force layout reflow
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      // Use scrollWidth/scrollHeight to capture the full content
      const width = Math.max(el.scrollWidth, 1100);
      const height = el.scrollHeight;

      const dataUrl = await toPng(el, {
        backgroundColor: "#f7f8fa",
        pixelRatio: 2,
        style: { padding: "24px" },
        cacheBust: true,
        width,
        height,
        canvasWidth: width * 3,
        canvasHeight: height * 3,
        style: { transform: "none" },
      });

      // Restore everything
      el.setAttribute("style", prevStyle);
      el.style.transform = prevTransform;
      removeBtns.forEach((b) => { b.style.display = b.dataset.prevDisplay || ""; delete b.dataset.prevDisplay; });

      const link = document.createElement("a");
      link.download = "my-club-schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export schedule:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <Link to="/" className="schedule-page__back">&larr; Clubs</Link>
        <h1 className="schedule-page__title">My Club Schedule</h1>
        <p className="schedule-page__subtitle">
          Plan your week. Clubs before 12 PM meet for 25 min; afternoon clubs meet for 50 min.
          Click any club on your schedule to swap it for another.
        </p>
      </header>

      {scheduleClubs.length === 0 ? (
        <div className="schedule-page__empty">
          <p className="schedule-page__empty-text">No clubs on your schedule yet.</p>
          <Link to="/" className="schedule-page__cta">Browse clubs and add to schedule</Link>
        </div>
      ) : (
        <>
          <div className="schedule-page__actions">
            <button
              type="button"
              className="schedule-page__export-btn"
              onClick={handleExport}
              disabled={isExporting}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v9m0 0L5 7m3 3l3-3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {isExporting ? "Exporting…" : "Export as PNG"}
            </button>
          </div>

          <div
            ref={scheduleRef}
            className="schedule-page__grids"
            data-exporting={isExporting ? "true" : "false"}
          >
            <WeekGrid
              weekType="Blue"
              clubs={scheduleClubs}
              allClubs={allClubs}
              scheduleIds={scheduleIds}
              onRemove={onRemove}
              onReplace={handleReplace}
              color="#2c5f8a"
            />
            <WeekGrid
              weekType="Green"
              clubs={scheduleClubs}
              allClubs={allClubs}
              scheduleIds={scheduleIds}
              onRemove={onRemove}
              onReplace={handleReplace}
              color="#2d6a4f"
            />
          </div>
        </>
      )}
    </div>
  );
}
