import { useMemo, Fragment } from "react";
import { Link } from "react-router-dom";
import "./SchedulePage.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = [
  "8:00 – 8:45",
  "Flex / Activity",
  "After school",
];

function assignClubToSlot(index) {
  const slotIndex = index % SLOTS.length;
  const dayIndex = Math.floor(index / SLOTS.length) % DAYS.length;
  return { dayIndex, slotIndex };
}

export function SchedulePage({ scheduleClubs, onRemove }) {
  const grid = useMemo(() => {
    const map = {};
    scheduleClubs.forEach((club, index) => {
      const { dayIndex, slotIndex } = assignClubToSlot(index);
      const key = `${dayIndex}-${slotIndex}`;
      if (!map[key]) map[key] = [];
      map[key].push(club);
    });
    return map;
  }, [scheduleClubs]);

  const getClubsInCell = (dayIndex, slotIndex) =>
    grid[`${dayIndex}-${slotIndex}`] || [];

  return (
    <div className="schedule-page">
      <header className="schedule-page__header">
        <Link to="/" className="schedule-page__back">
          ← Clubs
        </Link>
        <h1 className="schedule-page__title">Sample Schedule</h1>
        <p className="schedule-page__subtitle">
          Plan your week. Add clubs from the directory to see them here.
        </p>
      </header>

      {scheduleClubs.length === 0 ? (
        <div className="schedule-page__empty">
          <p className="schedule-page__empty-text">No clubs on your schedule yet.</p>
          <Link to="/" className="schedule-page__cta">
            Browse clubs and add to schedule
          </Link>
        </div>
      ) : (
        <div className="schedule-calendar">
          <div className="schedule-calendar__corner" />
          {DAYS.map((day) => (
            <div key={day} className="schedule-calendar__day-head">
              {day}
            </div>
          ))}
          {SLOTS.map((slot, slotIndex) => (
            <Fragment key={slot}>
              <div className="schedule-calendar__slot-label">
                {slot}
              </div>
              {DAYS.map((_, dayIndex) => {
                const clubsInCell = getClubsInCell(dayIndex, slotIndex);
                return (
                  <div
                    key={`${dayIndex}-${slotIndex}`}
                    className="schedule-calendar__cell"
                  >
                    {clubsInCell.map((club) => (
                      <div key={club.id} className="schedule-calendar__event">
                        <span className="schedule-calendar__event-name">
                          {club.Club_Name}
                        </span>
                        <button
                          type="button"
                          className="schedule-calendar__event-remove"
                          onClick={() => onRemove(club.id)}
                          aria-label={`Remove ${club.Club_Name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
