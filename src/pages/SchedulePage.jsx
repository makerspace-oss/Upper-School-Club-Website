import { useMemo, useRef, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import "./SchedulePage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};

/* Real Shipley schedule periods */
const TIME_SLOTS = [
  { label: "Period 1",  time: "8:25 – 9:15",   duration: 50 },
  { label: "Period 2",  time: "9:20 – 10:10",  duration: 50 },
  { label: "Period 3",  time: "10:40 – 11:55", duration: 75 },
  { label: "Period 4",  time: "12:00 – 12:50", duration: 50 },
  { label: "Period 5",  time: "1:30 – 2:20",   duration: 50 },
  { label: "Period 6",  time: "2:25 – 3:15",   duration: 50 },
];

/* Parse "Monday [Blue], Wednesday [Green]" */
function parseMeetDays(meetDays) {
  if (!meetDays || /see schedule|weekly|once|–/i.test(meetDays)) return [];
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

function getClubWeeks(club) {
  const parsed = parseMeetDays(club.Meet_Days);
  const weeks = new Set();
  parsed.forEach(({ week }) => { if (week) weeks.add(week); });
  if (weeks.size === 0) { weeks.add("Blue"); weeks.add("Green"); }
  return Array.from(weeks);
}

/* Build grid: clubs placed in Period 5 (activity period) by default */
function buildWeekGrid(clubs, weekType) {
  const grid = {};
  const ACTIVITY_SLOT = 4; // Period 5 index
  clubs.forEach((club) => {
    const parsed = parseMeetDays(club.Meet_Days);
    if (parsed.length === 0) {
      // No parseable days — place in Monday activity slot
      const key = `0-${ACTIVITY_SLOT}`;
      if (!grid[key]) grid[key] = [];
      if (!grid[key].some((c) => c.id === club.id)) grid[key].push(club);
      return;
    }
    parsed.forEach(({ day, week }) => {
      if (week && week !== weekType) return;
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx === -1) return;
      const key = `${dayIdx}-${ACTIVITY_SLOT}`;
      if (!grid[key]) grid[key] = [];
      if (!grid[key].some((c) => c.id === club.id)) grid[key].push(club);
    });
  });
  return grid;
}

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

/* ─── Replace Modal ─── */
function ReplaceModal({ club, day, weekType, alternatives, onReplace, onClose }) {
  const clubWeeks = getClubWeeks(club);
  const isMultiWeek = clubWeeks.length > 1;

  return (
    <div className="replace-modal__backdrop" onClick={onClose}>
      <div className="replace-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="replace-modal__close" onClick={onClose}>&times;</button>
        <h3 className="replace-modal__title">Replace {club.Club_Name}</h3>
        <p className="replace-modal__subtitle">{day} &middot; {weekType} Week</p>
        {isMultiWeek && (
          <p className="replace-modal__warning">
            This club meets in both {clubWeeks.join(" and ")} weeks. Replacing it removes it from all weeks.
          </p>
        )}
        {alternatives.length === 0 ? (
          <p className="replace-modal__empty">No other clubs meet on {day} during {weekType} week.</p>
        ) : (
          <ul className="replace-modal__list">
            {alternatives.map((alt) => (
              <li key={alt.id} className="replace-modal__item">
                <div className="replace-modal__item-info">
                  <span className="replace-modal__item-name">{alt.Club_Name}</span>
                  {alt.Meet_Days && <span className="replace-modal__item-days">{alt.Meet_Days}</span>}
                </div>
                <button
                  type="button"
                  className="replace-modal__item-btn"
                  onClick={() => onReplace(club.id, alt)}
                >Switch</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ─── Week Grid ─── */
function WeekGrid({ weekType, clubs, allClubs, scheduleIds, onRemove, onReplace, color }) {
  const [modalClub, setModalClub] = useState(null);
  const [modalDay, setModalDay] = useState(null);

  const grid = useMemo(() => buildWeekGrid(clubs, weekType), [clubs, weekType]);
  const overlaps = useMemo(() => findOverlaps(grid), [grid]);
  const overlapKeys = useMemo(() => new Set(overlaps.map((o) => o.key)), [overlaps]);

  const getClubs = (dayIdx, slotIdx) => grid[`${dayIdx}-${slotIdx}`] || [];

  const alternatives = useMemo(() => {
    if (!modalClub || !modalDay) return [];
    return findAlternatives(allClubs, scheduleIds, modalDay, weekType);
  }, [modalClub, modalDay, allClubs, scheduleIds, weekType]);

  return (
    <div className={`week-grid week-grid--${weekType.toLowerCase()}`}>
      <div className="week-grid__header" style={{ background: color }}>
        <span className="week-grid__header-label">{weekType} Week</span>
      </div>

      {overlaps.length > 0 && (
        <div className="week-grid__overlap-warning">
          {overlaps.length} overlap{overlaps.length > 1 ? "s" : ""} — click a club to swap it
        </div>
      )}

      <div className="week-grid__table">
        <div className="week-grid__corner" style={{ background: color }} />
        {DAYS.map((day) => (
          <div key={day} className="week-grid__day-head" style={{ background: color }}>{day}</div>
        ))}
        {TIME_SLOTS.map((slot, slotIdx) => (
          <div key={slot.label} className="week-grid__row" role="row">
            <div className="week-grid__slot-label">
              <span className="week-grid__slot-period">{slot.label}</span>
              <span className="week-grid__slot-time">{slot.time}</span>
            </div>
            {DAYS.map((_, dayIdx) => {
              const cellClubs = getClubs(dayIdx, slotIdx);
              const cellKey = `${dayIdx}-${slotIdx}`;
              const hasOverlap = overlapKeys.has(cellKey);
              return (
                <div key={cellKey} className={`week-grid__cell${hasOverlap ? " week-grid__cell--overlap" : ""}`}>
                  {cellClubs.map((club) => (
                    <div
                      key={club.id}
                      className="week-grid__event"
                      style={{ borderLeftColor: color, cursor: "pointer" }}
                      onClick={() => { setModalClub(club); setModalDay(DAYS[dayIdx]); }}
                      title="Click to replace"
                    >
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
          onReplace={(oldId, newClub) => { onReplace(oldId, newClub); setModalClub(null); setModalDay(null); }}
          onClose={() => { setModalClub(null); setModalDay(null); }}
        />
      )}
    </div>
  );
}

/* ─── Schedule Page ─── */
export function SchedulePage({ scheduleClubs, allClubs = [], onRemove, onAdd }) {
  const scheduleRef = useRef(null);

  const scheduleIds = useMemo(() => new Set(scheduleClubs.map((c) => c.id)), [scheduleClubs]);

  const handleReplace = useCallback((oldId, newClub) => {
    onRemove(oldId);
    onAdd(newClub);
  }, [onRemove, onAdd]);

  const handleExport = useCallback(async () => {
    if (!scheduleRef.current) return;
    try {
      // Temporarily expand for export
      const el = scheduleRef.current;
      const prev = el.style.cssText;
      el.style.width = "1200px";
      el.style.maxWidth = "none";
      el.style.overflow = "visible";

      const dataUrl = await toPng(el, {
        backgroundColor: "#f7f8fa",
        pixelRatio: 2,
        width: 1200,
        style: { padding: "24px" },
      });

      el.style.cssText = prev;

      const link = document.createElement("a");
      link.download = "my-club-schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export schedule:", err);
    }
  }, []);

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <Link to="/" className="schedule-page__back">&larr; Clubs</Link>
        <h1 className="schedule-page__title">My Club Schedule</h1>
        <p className="schedule-page__subtitle">
          Plan your week with Blue and Green rotation weeks. Click any club to swap it for another option.
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
            <button type="button" className="schedule-page__export-btn" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v9m0 0L5 7m3 3l3-3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export as PNG
            </button>
          </div>

          <div ref={scheduleRef} className="schedule-page__grids">
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
