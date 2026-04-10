import { useRef } from "react";

function getTags(tagsString) {
  if (!tagsString) return [];
  return tagsString
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function ClubCard({ club, isExpanded, onToggle, onAddToSchedule, isOnSchedule }) {
  const contentRef = useRef(null);

  const tags = getTags(club.Club_Tags);
  const hasIcon = club.Club_Icon_URL && club.Club_Icon_URL.trim() !== "";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <article
      className={`club-card ${isExpanded ? "club-card--expanded" : ""}`}
      data-club-id={club.id}
    >
      <button
        type="button"
        className="club-card__trigger"
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isExpanded}
        aria-controls={`club-content-${club.id}`}
        id={`club-trigger-${club.id}`}
      >
        <div className="club-card__header">
          <div className="club-card__icon" aria-hidden="true">
            {hasIcon ? (
              <img
                src={club.Club_Icon_URL}
                alt=""
                loading="lazy"
                className="club-card__icon-img"
              />
            ) : (
              <span className="club-card__icon-fallback">
                {club.Club_Name.charAt(0)}
              </span>
            )}
          </div>
          <div className="club-card__title-wrap">
            <h2 className="club-card__title">{club.Club_Name}</h2>
            {tags.length > 0 && (
              <div className="club-card__tags" role="list">
                {tags.map((tag) => (
                  <span key={tag} className="club-card__tag" role="listitem">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <span className="club-card__chevron" aria-hidden="true">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </button>

      <div
        id={`club-content-${club.id}`}
        className="club-card__content-wrap"
        role="region"
        aria-labelledby={`club-trigger-${club.id}`}
        hidden={!isExpanded}
      >
        <div ref={contentRef} className="club-card__content">
          {club.Club_Description && (
            <p className="club-card__description">{club.Club_Description}</p>
          )}
          {club.Leadership && (
            <p className="club-card__meta">
              <strong>Leadership:</strong> {club.Leadership}
            </p>
          )}
          {club.Club_Proctors && (
            <p className="club-card__meta">
              <strong>Student Leaders:</strong> {club.Club_Proctors}
            </p>
          )}
          {club.Meet_Days && (
            <p className="club-card__meta">
              <strong>Meeting Day:</strong> {club.Meet_Days}
            </p>
          )}
          {club.Notes && (
            <p className="club-card__meta">
              <strong>Notes:</strong> {club.Notes}
            </p>
          )}
          {tags.length > 0 && (
            <p className="club-card__meta">
              <strong>Tags:</strong> {tags.join(", ")}
            </p>
          )}
          {onAddToSchedule && (
            <div className="club-card__actions">
              <button
                type="button"
                className="club-card__schedule-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToSchedule(club);
                }}
                disabled={isOnSchedule}
              >
                {isOnSchedule ? "On schedule" : "Add to Sample Schedule"}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
