import { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toPng } from "html-to-image";
import { ClubModal } from "../components/ClubCard";
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
  const grid = {};
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
function OverlapModal({ club, currentDay, weekType, freeDays, alternatives, onMove, onSwap, onRemove, onView, onClose }) {
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
            const btn = document.querySelector(".finalize-modal__copy-btn");
            if (btn) { btn.textContent = "Copied!"; setTimeout(() => { btn.textContent = "Copy List"; }, 2000); }
          }}
        >Copy List</button>
      </div>
    </div>
  );
}

/* ─── Week Grid (days only) ─── */
function WeekGrid({ weekType, clubs, allClubs, scheduleIds, overrides, onRemove, onMoveDay, onSwap, color }) {
  const [modalClub, setModalClub] = useState(null);
  const [modalDayIdx, setModalDayIdx] = useState(null);
  const [viewClub, setViewClub] = useState(null);

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

  const hasOverlaps = useMemo(() => {
    const blueGrid = buildDayGrid(scheduleClubs, "Blue", dayOverrides);
    const greenGrid = buildDayGrid(scheduleClubs, "Green", dayOverrides);
    return findOverlaps(blueGrid).length > 0 || findOverlaps(greenGrid).length > 0;
  }, [scheduleClubs, dayOverrides]);

  const handleExport = useCallback(async () => {
    try {
      // Build a polished, standalone export layout (independent of the live DOM)
      const NAVY = "#1b2a4a";
      const GREEN = "#3f7f5c";
      const BLUE = "#2c5f8a";
      const GREEN_WK = "#2d6a4f";
      const SHIPLEY_LOGO_URL = "https://images.squarespace-cdn.com/content/v1/601586a260bac64bcb51fcdc/1621025263615-E7GTWIJFVTLA16ZMDNP3/Shipley_Inst_H_wTxt_fulclr_RGB+%281%29.png";

      // Convert the logo to a data URL so html-to-image can render it
      // (cross-origin images would otherwise be blank in the PNG due to CORS)
      let SHIPLEY_LOGO = SHIPLEY_LOGO_URL;
      try {
        const res = await fetch(SHIPLEY_LOGO_URL, { mode: "cors" });
        const blob = await res.blob();
        SHIPLEY_LOGO = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("[Export] Could not inline Shipley logo, falling back to URL:", err);
      }

      const blueGrid = buildDayGrid(scheduleClubs, "Blue", dayOverrides);
      const greenGrid = buildDayGrid(scheduleClubs, "Green", dayOverrides);

      // Renders one row in the day-headers strip + one row of cells beneath
      const renderWeek = (label, color, grid, accentBg) => {
        const headerRow = `
          <div style="display:grid;grid-template-columns:140px repeat(5,1fr);align-items:stretch;background:${color};color:#fff;">
            <div style="padding:14px 18px;display:flex;align-items:center;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;border-right:1px solid rgba(255,255,255,0.18);">
              ${label} Week
            </div>
            ${DAYS.map((d, i) => `
              <div style="padding:14px 8px;text-align:center;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;${i === DAYS.length - 1 ? "" : "border-right:1px solid rgba(255,255,255,0.18);"}">${d}</div>
            `).join("")}
          </div>
        `;
        const bodyRow = `
          <div style="display:grid;grid-template-columns:140px repeat(5,1fr);background:#fff;">
            <div style="padding:18px;display:flex;align-items:center;background:#f7f8fa;border-right:1px solid #e4e7ed;">
              <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#fff;border:1px solid #e4e7ed;border-radius:999px;font-size:10px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:0.08em;">
                <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;"></span>
                Flex Period
              </span>
            </div>
            ${DAYS.map((day, dayIdx) => {
              const clubs = grid[dayIdx] || [];
              const isLast = dayIdx === DAYS.length - 1;
              return `
                <div style="padding:12px;border-right:${isLast ? "none" : "1px solid #e4e7ed"};display:flex;flex-direction:column;gap:8px;min-height:96px;">
                  ${clubs.length === 0
                    ? `<div style="flex:1;display:flex;align-items:center;justify-content:center;"><span style="display:block;width:24px;height:2px;background:#e4e7ed;border-radius:2px;"></span></div>`
                    : clubs.map((c) => `
                      <div style="background:${accentBg};border:1px solid ${accentBg === "#eef4f9" ? "#d4e3ee" : "#d4e7d9"};border-left:3px solid ${color};border-radius:8px;padding:9px 11px;">
                        <div style="font-weight:700;color:${NAVY};font-size:12.5px;line-height:1.35;word-break:break-word;">${escapeHtml(c.Club_Name)}</div>
                      </div>
                    `).join("")}
                </div>
              `;
            }).join("")}
          </div>
        `;
        return `
          <div style="border:1.5px solid #e4e7ed;border-radius:14px;overflow:hidden;box-shadow:0 2px 6px rgba(27,42,74,0.06);">
            ${headerRow}
            ${bodyRow}
          </div>
        `;
      };

      const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const html = `
        <div style="
          width:1100px;
          padding:56px 56px 40px;
          background:#ffffff;
          font-family:'DM Sans','Helvetica Neue',system-ui,-apple-system,sans-serif;
          color:${NAVY};
          box-sizing:border-box;
        ">
          <!-- Header -->
          <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:32px;padding-bottom:24px;margin-bottom:8px;">
            <div style="display:flex;align-items:center;gap:20px;">
              <img src="${SHIPLEY_LOGO}" crossorigin="anonymous" style="height:54px;width:auto;display:block;" alt="Shipley"/>
              <div style="border-left:2px solid ${GREEN};padding-left:20px;">
                <div style="font-size:11px;font-weight:700;color:${GREEN};text-transform:uppercase;letter-spacing:0.14em;margin-bottom:6px;">Upper School</div>
                <div style="font-size:28px;font-weight:800;color:${NAVY};letter-spacing:-0.02em;line-height:1;">My Club Schedule</div>
              </div>
            </div>
            <div style="text-align:right;line-height:1.3;">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:#8b95a8;font-weight:700;">Generated</div>
              <div style="font-size:14px;color:${NAVY};font-weight:700;margin-top:3px;">${today}</div>
              <div style="font-size:11px;color:#8b95a8;margin-top:6px;font-weight:500;">${scheduleClubs.length} club${scheduleClubs.length === 1 ? "" : "s"} selected</div>
            </div>
          </div>

          <div style="height:1px;background:linear-gradient(90deg,${GREEN} 0%,${GREEN} 30%,#e4e7ed 30%,#e4e7ed 100%);margin-bottom:28px;"></div>

          <!-- Schedule grids -->
          <div style="display:flex;flex-direction:column;gap:18px;">
            ${renderWeek("Blue", BLUE, blueGrid, "#eef4f9")}
            ${renderWeek("Green", GREEN_WK, greenGrid, "#edf5f0")}
          </div>

          <!-- Footer -->
          <div style="margin-top:32px;padding-top:18px;border-top:1px solid #e4e7ed;text-align:center;">
            <div style="font-style:italic;font-size:13px;color:${GREEN};font-weight:600;letter-spacing:0.01em;">"Courage for the deed, grace for the doing"</div>
            <div style="font-size:10px;color:#8b95a8;margin-top:8px;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">The Shipley School &middot; Upper School Clubs</div>
          </div>
        </div>
      `;

      // Mount offscreen
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      container.innerHTML = html;
      document.body.appendChild(container);
      const exportEl = container.firstElementChild;

      // Wait for the logo image to load (so it appears in the PNG)
      const img = exportEl.querySelector("img");
      if (img && !img.complete) {
        await new Promise((res) => {
          img.onload = res;
          img.onerror = res;
          setTimeout(res, 3000);
        });
      }
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const dataUrl = await toPng(exportEl, {
        backgroundColor: "#ffffff",
        pixelRatio: 2.5,
        cacheBust: true,
        width: 1100,
        height: exportEl.scrollHeight,
      });

      document.body.removeChild(container);

      const link = document.createElement("a");
      link.download = `shipley-club-schedule-${today.replace(/[, ]+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export:", err);
    }
  }, [scheduleClubs, dayOverrides]);

  // Tiny HTML escaper for export safety
  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

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
            <div className="schedule-page__share-group">
              <button type="button" className="schedule-page__share-btn" onClick={handleShare}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="12" cy="3" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="4" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="13" r="2" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M5.8 7l4.4-3M5.8 9l4.4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                {copied ? "Link Copied!" : "Share"}
              </button>
              <span
                className="schedule-page__share-info"
                tabIndex={0}
                role="button"
                aria-label="What does Share do?"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="8" cy="4.75" r="0.9" fill="currentColor"/>
                  <path d="M8 7.25v4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="schedule-page__share-tooltip" role="tooltip">
                  <strong>Share with friends</strong>
                  Click <em>Share</em> to copy a link to your clipboard. Anyone who opens it will see your exact club schedule — no account or login needed.
                </span>
              </span>
            </div>
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
