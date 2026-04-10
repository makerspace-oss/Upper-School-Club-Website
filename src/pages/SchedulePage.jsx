import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import "./SchedulePage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};

const TIME_SLOTS = [
  { label: "Period 1", time: "8:25 – 9:15" },
  { label: "Period 2", time: "9:20 – 10:10" },
  { label: "Period 3", time: "10:40 – 11:55" },
  { label: "Period 4", time: "12:00 – 12:50" },
  { label: "Period 5", time: "1:30 – 2:20" },
  { label: "Period 6", time: "2:25 – 3:15" },
];

const ACTIVITY_SLOT = 4; // Period 5

/* ─── Parsing helpers ─── */

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

/** Get all days a club meets in a given week type */
function getClubDaysForWeek(club, weekType) {
  const parsed = parseMeetDays(club.Meet_Days);
  if (parsed.length === 0) return [DAYS[0]]; // default Monday
  return parsed
    .filter(({ week }) => !week || week === weekType)
    .map(({ day }) => day)
    .filter(Boolean);
}

/**
 * Build grid with day overrides.
 * overrides: { "clubId": dayIndex } — pins a club to a specific day for this week
 */
function buildWeekGrid(clubs, weekType, overrides = {}) {
  const grid = {};
  clubs.forEach((club) => {
    const overrideKey = `${club.id}-${weekType}`;
    const overriddenDay = overrides[overrideKey];

    if (overriddenDay !== undefined) {
      // Club has been manually pinned to a specific day
      const key = `${overriddenDay}-${ACTIVITY_SLOT}`;
      if (!grid[key]) grid[key] = [];
      if (!grid[key].some((c) => c.id === club.id)) grid[key].push(club);
      return;
    }

    const days = getClubDaysForWeek(club, weekType);
    if (days.length === 0) return;

    days.forEach((day) => {
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
  return Object.entries(grid)
    .filter(([, clubs]) => clubs.length > 1)
    .map(([key, clubs]) => {
      const [dayIdx, slotIdx] = key.split("-").map(Number);
      return { dayIdx, slotIdx, clubs, key };
    });
}

/**
 * Find free days: other days this club meets in this week
 * that don't already have a club in the activity slot.
 */
function findFreeDays(club, weekType, grid, currentDayIdx) {
  const allDays = getClubDaysForWeek(club, weekType);
  return allDays
    .map((day) => ({ day, dayIdx: DAYS.indexOf(day) }))
    .filter(({ dayIdx }) => dayIdx !== -1 && dayIdx !== currentDayIdx)
    .filter(({ dayIdx }) => {
      const key = `${dayIdx}-${ACTIVITY_SLOT}`;
      const existing = grid[key] || [];
      // Free if no other clubs there (or only this club itself)
      return existing.filter((c) => c.id !== club.id).length === 0;
    });
}

/* ─── Move Modal ─── */
function MoveModal({ club, currentDay, weekType, freeDays, onMove, onRemove, onClose }) {
  return (
    <div className="replace-modal__backdrop" onClick={onClose}>
      <div className="replace-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="replace-modal__close" onClick={onClose}>&times;</button>
        <h3 className="replace-modal__title">Resolve overlap</h3>
        <p className="replace-modal__subtitle">
          <strong>{club.Club_Name}</strong> overlaps on {currentDay} &middot; {weekType} Week
        </p>

        {freeDays.length > 0 ? (
          <>
            <p className="replace-modal__hint">
              Move it to a free day this club also meets:
            </p>
            <ul className="replace-modal__list">
              {freeDays.map(({ day, dayIdx }) => (
                <li key={dayIdx} className="replace-modal__item">
                  <div className="replace-modal__item-info">
                    <span className="replace-modal__item-name">{day}</span>
                    <span className="replace-modal__item-days">Period 5 &middot; No conflicts</span>
                  </div>
                  <button
                    type="button"
                    className="replace-modal__item-btn"
                    onClick={() => onMove(club.id, weekType, dayIdx)}
                  >Move here</button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="replace-modal__empty">
            This club doesn't meet on any other conflict-free days during {weekType} week.
          </p>
        )}

        <div className="replace-modal__footer">
          <button
            type="button"
            className="replace-modal__remove-btn"
            onClick={() => { onRemove(club.id); onClose(); }}
          >Remove from schedule</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Week Grid ─── */
function WeekGrid({ weekType, clubs, overrides, onRemove, onMoveDay, color }) {
  const [modalClub, setModalClub] = useState(null);
  const [modalDayIdx, setModalDayIdx] = useState(null);

  const grid = useMemo(() => buildWeekGrid(clubs, weekType, overrides), [clubs, weekType, overrides]);
  const overlaps = useMemo(() => findOverlaps(grid), [grid]);
  const overlapKeys = useMemo(() => new Set(overlaps.map((o) => o.key)), [overlaps]);

  const getClubs = (dayIdx, slotIdx) => grid[`${dayIdx}-${slotIdx}`] || [];

  const freeDays = useMemo(() => {
    if (!modalClub || modalDayIdx === null) return [];
    return findFreeDays(modalClub, weekType, grid, modalDayIdx);
  }, [modalClub, modalDayIdx, weekType, grid]);

  return (
    <div className={`week-grid week-grid--${weekType.toLowerCase()}`}>
      <div className="week-grid__header" style={{ background: color }}>
        <span className="week-grid__header-label">{weekType} Week</span>
      </div>

      {overlaps.length > 0 && (
        <div className="week-grid__overlap-warning">
          {overlaps.length} overlap{overlaps.length > 1 ? "s" : ""} — click a club to move it to a free day
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
                      className={`week-grid__event${hasOverlap ? " week-grid__event--overlap" : ""}`}
                      style={{ borderLeftColor: color, cursor: hasOverlap ? "pointer" : "default" }}
                      onClick={hasOverlap ? () => { setModalClub(club); setModalDayIdx(dayIdx); } : undefined}
                      title={hasOverlap ? "Click to resolve overlap" : club.Club_Name}
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

      {modalClub && modalDayIdx !== null && (
        <MoveModal
          club={modalClub}
          currentDay={DAYS[modalDayIdx]}
          weekType={weekType}
          freeDays={freeDays}
          onMove={(clubId, wk, newDayIdx) => {
            onMoveDay(clubId, wk, newDayIdx);
            setModalClub(null);
            setModalDayIdx(null);
          }}
          onRemove={onRemove}
          onClose={() => { setModalClub(null); setModalDayIdx(null); }}
        />
      )}
    </div>
  );
}

/* ─── Schedule Page ─── */
export function SchedulePage({ scheduleClubs, onRemove }) {
  const scheduleRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Day overrides: { "clubId-Blue": 2 } means "show this club on Wed for Blue week"
  const [dayOverrides, setDayOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem("scheduleDayOverrides");
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("scheduleDayOverrides", JSON.stringify(dayOverrides));
  }, [dayOverrides]);

  // Clean up overrides for clubs no longer on the schedule
  useEffect(() => {
    const ids = new Set(scheduleClubs.map((c) => c.id));
    setDayOverrides((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, val]) => {
        const clubId = key.split("-")[0];
        if (ids.has(clubId)) next[key] = val;
      });
      return next;
    });
  }, [scheduleClubs]);

  const handleMoveDay = useCallback((clubId, weekType, newDayIdx) => {
    setDayOverrides((prev) => ({
      ...prev,
      [`${clubId}-${weekType}`]: newDayIdx,
    }));
  }, []);

  const handleExport = useCallback(async () => {
    if (!scheduleRef.current) return;
    try {
      const el = scheduleRef.current;

      // Save original styles
      const prevStyle = el.getAttribute("style") || "";
      const prevClass = el.className;

      // Force layout to be wide enough and fully visible for capture
      el.style.width = "1300px";
      el.style.maxWidth = "none";
      el.style.overflow = "visible";
      el.style.flexWrap = "nowrap";
      el.style.padding = "24px";

      // Force all children to be visible
      el.querySelectorAll(".week-grid").forEach((g) => {
        g.style.minWidth = "580px";
        g.style.flex = "1 0 580px";
      });

      // Wait for layout reflow
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const dataUrl = await toPng(el, {
        backgroundColor: "#f7f8fa",
        pixelRatio: 2,
        cacheBust: true,
      });

      // Restore original styles
      el.setAttribute("style", prevStyle);
      el.className = prevClass;
      el.querySelectorAll(".week-grid").forEach((g) => {
        g.removeAttribute("style");
      });

      const link = document.createElement("a");
      link.download = "my-club-schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export schedule:", err);
    }
  }, []);

  const handleShare = useCallback(() => {
    const ids = scheduleClubs.map((c) => c.id).join(",");
    const encoded = btoa(ids);
    const url = `${window.location.origin}/schedule?s=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback: select a temporary input
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [scheduleClubs]);

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <Link to="/" className="schedule-page__back">&larr; Clubs</Link>
        <h1 className="schedule-page__title">My Club Schedule</h1>
        <p className="schedule-page__subtitle">
          Plan your week with Blue and Green rotation weeks. If clubs overlap, click one to move it to a free day.
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
            <button type="button" className="schedule-page__share-btn" onClick={handleShare}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5.8 7l4.4-3M5.8 9l4.4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {copied ? "Link Copied!" : "Share Schedule"}
            </button>
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
              overrides={dayOverrides}
              onRemove={onRemove}
              onMoveDay={handleMoveDay}
              color="#2c5f8a"
            />
            <WeekGrid
              weekType="Green"
              clubs={scheduleClubs}
              overrides={dayOverrides}
              onRemove={onRemove}
              onMoveDay={handleMoveDay}
              color="#2d6a4f"
            />
          </div>
        </>
      )}
    </div>
  );
}
