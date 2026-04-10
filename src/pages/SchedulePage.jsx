import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import "./SchedulePage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const DAY_FULL = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri",
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri",
};

/* ─── Parsing ─── */

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

function getClubDaysForWeek(club, weekType) {
  const parsed = parseMeetDays(club.Meet_Days);
  if (parsed.length === 0) return [DAYS[0]];
  return parsed
    .filter(({ week }) => !week || week === weekType)
    .map(({ day }) => day)
    .filter(Boolean);
}

/** Build a simple day → [clubs] map for a week type */
function buildDayGrid(clubs, weekType, overrides = {}) {
  const grid = {}; // dayIdx → [clubs]
  DAYS.forEach((_, i) => { grid[i] = []; });

  clubs.forEach((club) => {
    const overrideKey = `${club.id}-${weekType}`;
    if (overrides[overrideKey] !== undefined) {
      const dayIdx = overrides[overrideKey];
      if (!grid[dayIdx].some((c) => c.id === club.id)) grid[dayIdx].push(club);
      return;
    }
    const days = getClubDaysForWeek(club, weekType);
    days.forEach((day) => {
      const dayIdx = DAYS.indexOf(day);
      if (dayIdx !== -1 && !grid[dayIdx].some((c) => c.id === club.id)) {
        grid[dayIdx].push(club);
      }
    });
  });
  return grid;
}

function findOverlaps(grid) {
  return Object.entries(grid)
    .filter(([, clubs]) => clubs.length > 1)
    .map(([dayIdx, clubs]) => ({ dayIdx: Number(dayIdx), clubs }));
}

function findFreeDays(club, weekType, grid, currentDayIdx) {
  const allDays = getClubDaysForWeek(club, weekType);
  return allDays
    .map((day) => ({ day, dayIdx: DAYS.indexOf(day) }))
    .filter(({ dayIdx }) => dayIdx !== -1 && dayIdx !== currentDayIdx)
    .filter(({ dayIdx }) => grid[dayIdx].filter((c) => c.id !== club.id).length === 0);
}

function findAlternativeClubs(allClubs, scheduleIds, weekType, grid) {
  return allClubs.filter((club) => {
    if (scheduleIds.has(club.id) || club.Status !== "Active") return false;
    const days = getClubDaysForWeek(club, weekType);
    if (days.length === 0) return false;
    return days.some((day) => {
      const dayIdx = DAYS.indexOf(day);
      return dayIdx !== -1 && grid[dayIdx].length === 0;
    });
  });
}

/* ─── Overlap Modal ─── */
function OverlapModal({ club, currentDay, weekType, freeDays, alternatives, onMove, onSwap, onRemove, onClose }) {
  return (
    <div className="replace-modal__backdrop" onClick={onClose}>
      <div className="replace-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="replace-modal__close" onClick={onClose}>&times;</button>
        <h3 className="replace-modal__title">Resolve overlap</h3>
        <p className="replace-modal__subtitle">
          <strong>{club.Club_Name}</strong> overlaps on {currentDay} &middot; {weekType} Week
        </p>

        {freeDays.length > 0 && (
          <div className="replace-modal__section">
            <p className="replace-modal__hint">Move to another day this club meets:</p>
            <ul className="replace-modal__list">
              {freeDays.map(({ day, dayIdx }) => (
                <li key={dayIdx} className="replace-modal__item">
                  <div className="replace-modal__item-info">
                    <span className="replace-modal__item-name">{day}</span>
                    <span className="replace-modal__item-days">No conflicts</span>
                  </div>
                  <button type="button" className="replace-modal__item-btn" onClick={() => onMove(club.id, weekType, dayIdx)}>Move</button>
                </li>
              ))}
            </ul>
          </div>
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
                  <button type="button" className="replace-modal__item-btn" onClick={() => onSwap(club.id, alt)}>Swap</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {freeDays.length === 0 && alternatives.length === 0 && (
          <p className="replace-modal__empty">No alternatives available to resolve this overlap.</p>
        )}

        <div className="replace-modal__footer">
          <button type="button" className="replace-modal__remove-btn" onClick={() => { onRemove(club.id); onClose(); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            Remove from schedule
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Finalize Modal ─── */
function FinalizeModal({ clubs, onClose }) {
  return (
    <div className="replace-modal__backdrop" onClick={onClose}>
      <div className="replace-modal finalize-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="replace-modal__close" onClick={onClose}>&times;</button>
        <h3 className="replace-modal__title">Your Club Selections</h3>
        <p className="replace-modal__subtitle">Copy these names into the Google Form sign-up:</p>
        <ul className="finalize-modal__list">
          {clubs.map((club) => (
            <li key={club.id} className="finalize-modal__item">{club.Club_Name}</li>
          ))}
        </ul>
        <button
          type="button"
          className="finalize-modal__copy-btn"
          onClick={() => {
            const text = clubs.map((c) => c.Club_Name).join("\n");
            navigator.clipboard.writeText(text).catch(() => {
              const ta = document.createElement("textarea");
              ta.value = text;
              document.body.appendChild(ta);
              ta.select();
              document.execCommand("copy");
              document.body.removeChild(ta);
            });
            // Visual feedback
            const btn = document.querySelector('.finalize-modal__copy-btn');
            if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy List"; }, 2000); }
          }}
        >Copy List</button>
      </div>
    </div>
  );
}

/* ─── Week Grid (days only, no periods) ─── */
function WeekGrid({ weekType, clubs, allClubs, scheduleIds, overrides, onRemove, onMoveDay, onSwap, color }) {
  const [modalClub, setModalClub] = useState(null);
  const [modalDayIdx, setModalDayIdx] = useState(null);

  const grid = useMemo(() => buildDayGrid(clubs, weekType, overrides), [clubs, weekType, overrides]);
  const overlaps = useMemo(() => findOverlaps(grid), [grid]);
  const overlapDays = useMemo(() => new Set(overlaps.map((o) => o.dayIdx)), [overlaps]);

  const freeDays = useMemo(() => {
    if (!modalClub || modalDayIdx === null) return [];
    return findFreeDays(modalClub, weekType, grid, modalDayIdx);
  }, [modalClub, modalDayIdx, weekType, grid]);

  const alternatives = useMemo(() => {
    if (!modalClub) return [];
    return findAlternativeClubs(allClubs, scheduleIds, weekType, grid);
  }, [modalClub, allClubs, scheduleIds, weekType, grid]);

  return (
    <div className={`week-grid week-grid--${weekType.toLowerCase()}`}>
      <div className="week-grid__header" style={{ background: color }}>
        <span className="week-grid__header-label">{weekType} Week</span>
        {overlaps.length > 0 && (
          <span className="week-grid__header-badge">
            {overlaps.length} overlap{overlaps.length > 1 ? "s" : ""}
          </span>
        )}
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
          );
        })}
      </div>

      {modalClub && modalDayIdx !== null && (
        <OverlapModal
          club={modalClub}
          currentDay={DAYS[modalDayIdx]}
          weekType={weekType}
          freeDays={freeDays}
          alternatives={alternatives}
          onMove={(id, wk, di) => { onMoveDay(id, wk, di); setModalClub(null); setModalDayIdx(null); }}
          onSwap={(id, nc) => { onSwap(id, nc); setModalClub(null); setModalDayIdx(null); }}
          onRemove={onRemove}
          onClose={() => { setModalClub(null); setModalDayIdx(null); }}
        />
      )}
    </div>
  );
}

/* ─── Schedule Page ─── */
export function SchedulePage({ scheduleClubs, allClubs = [], onRemove, onAdd }) {
  const scheduleRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showFinalize, setShowFinalize] = useState(false);

  const [dayOverrides, setDayOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem("scheduleDayOverrides") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("scheduleDayOverrides", JSON.stringify(dayOverrides));
  }, [dayOverrides]);

  useEffect(() => {
    const ids = new Set(scheduleClubs.map((c) => c.id));
    setDayOverrides((prev) => {
      const next = {};
      Object.entries(prev).forEach(([key, val]) => {
        if (ids.has(key.split("-")[0])) next[key] = val;
      });
      return next;
    });
  }, [scheduleClubs]);

  const scheduleIds = useMemo(() => new Set(scheduleClubs.map((c) => c.id)), [scheduleClubs]);

  const handleSwap = useCallback((oldId, newClub) => {
    onRemove(oldId);
    onAdd(newClub);
  }, [onRemove, onAdd]);

  const handleMoveDay = useCallback((clubId, weekType, newDayIdx) => {
    setDayOverrides((prev) => ({ ...prev, [`${clubId}-${weekType}`]: newDayIdx }));
  }, []);

  // Check for overlaps across both weeks
  const hasOverlaps = useMemo(() => {
    const blueGrid = buildDayGrid(scheduleClubs, "Blue", dayOverrides);
    const greenGrid = buildDayGrid(scheduleClubs, "Green", dayOverrides);
    return findOverlaps(blueGrid).length > 0 || findOverlaps(greenGrid).length > 0;
  }, [scheduleClubs, dayOverrides]);

  const handleExport = useCallback(async () => {
    if (!scheduleRef.current) return;
    try {
      const el = scheduleRef.current;
      const prevStyle = el.getAttribute("style") || "";
      el.style.width = "900px";
      el.style.maxWidth = "none";
      el.style.overflow = "visible";
      el.style.padding = "24px";
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      const dataUrl = await toPng(el, { backgroundColor: "#f7f8fa", pixelRatio: 2, cacheBust: true });
      el.setAttribute("style", prevStyle);
      const link = document.createElement("a");
      link.download = "my-club-schedule.png";
      link.href = dataUrl;
      link.click();
    } catch (err) { console.error("Failed to export:", err); }
  }, []);

  const handleShare = useCallback(() => {
    const ids = scheduleClubs.map((c) => c.id).join(",");
    const url = `${window.location.origin}/schedule?s=${btoa(ids)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      const input = document.createElement("input");
      input.value = url; document.body.appendChild(input); input.select();
      document.execCommand("copy"); document.body.removeChild(input);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [scheduleClubs]);

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <Link to="/" className="schedule-page__back">&larr; Clubs</Link>
        <h1 className="schedule-page__title">My Club Schedule</h1>
        <p className="schedule-page__subtitle">
          Plan your Blue and Green rotation weeks. If clubs overlap, click one to resolve it.
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
              {copied ? "Link Copied!" : "Share"}
            </button>
            <button type="button" className="schedule-page__export-btn" onClick={handleExport}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M8 1v9m0 0L5 7m3 3l3-3M2 12v1.5A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Export PNG
            </button>
            <button
              type="button"
              className={`schedule-page__finalize-btn${hasOverlaps ? " schedule-page__finalize-btn--disabled" : ""}`}
              onClick={() => { if (!hasOverlaps) setShowFinalize(true); }}
              disabled={hasOverlaps}
              title={hasOverlaps ? "Resolve all overlaps before finalizing" : "View your final club list"}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5l3.5 3.5L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {hasOverlaps ? "Fix Overlaps First" : "Finalize List"}
            </button>
          </div>

          <div ref={scheduleRef} className="schedule-page__grids">
            <WeekGrid weekType="Blue" clubs={scheduleClubs} allClubs={allClubs} scheduleIds={scheduleIds} overrides={dayOverrides} onRemove={onRemove} onMoveDay={handleMoveDay} onSwap={handleSwap} color="#2c5f8a" />
            <WeekGrid weekType="Green" clubs={scheduleClubs} allClubs={allClubs} scheduleIds={scheduleIds} overrides={dayOverrides} onRemove={onRemove} onMoveDay={handleMoveDay} onSwap={handleSwap} color="#2d6a4f" />
          </div>

          {showFinalize && (
            <FinalizeModal clubs={scheduleClubs} onClose={() => setShowFinalize(false)} />
          )}
        </>
      )}
    </div>
  );
}
