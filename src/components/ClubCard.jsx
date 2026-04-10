import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

function getTags(tagsString) {
  if (!tagsString) return [];
  return tagsString.split(",").map((t) => t.trim()).filter(Boolean);
}

function ClubModal({ club, isOnSchedule, onAddToSchedule, onClose }) {
  const [closing, setClosing] = useState(false);
  const [added, setAdded] = useState(false);
  const tags = getTags(club.Club_Tags);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 250);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const handleAdd = () => {
    if (isOnSchedule || added) return;
    setAdded(true);
    onAddToSchedule(club);
    // Close modal after a brief moment to show the confirmation
    setTimeout(() => {
      setClosing(true);
      setTimeout(onClose, 250);
    }, 600);
  };

  const hasIcon = club.Club_Icon_URL && club.Club_Icon_URL.trim() !== "";

  return createPortal(
    <div
      className={`club-modal__backdrop ${closing ? "club-modal__backdrop--closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`club-modal ${closing ? "club-modal--closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={club.Club_Name}
      >
        <button type="button" className="club-modal__close" onClick={handleClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className="club-modal__header">
          <div className="club-modal__icon" aria-hidden="true">
            {hasIcon ? (
              <img src={club.Club_Icon_URL} alt="" className="club-modal__icon-img" />
            ) : (
              <span className="club-modal__icon-fallback">{club.Club_Name.charAt(0)}</span>
            )}
          </div>
          <div className="club-modal__title-area">
            <h2 className="club-modal__title">{club.Club_Name}</h2>
            {tags.length > 0 && (
              <div className="club-modal__tags">
                {tags.map((tag) => (
                  <span key={tag} className="club-modal__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {club.Club_Description && (
          <p className="club-modal__description">{club.Club_Description}</p>
        )}

        <div className="club-modal__details">
          {club.Leadership && (
            <div className="club-modal__detail">
              <span className="club-modal__detail-label">Leadership</span>
              <span className="club-modal__detail-value">{club.Leadership}</span>
            </div>
          )}
          {club.Club_Proctors && (
            <div className="club-modal__detail">
              <span className="club-modal__detail-label">Student Leaders</span>
              <span className="club-modal__detail-value">{club.Club_Proctors}</span>
            </div>
          )}
          {club.Meet_Days && (
            <div className="club-modal__detail">
              <span className="club-modal__detail-label">Meeting Day</span>
              <span className="club-modal__detail-value">{club.Meet_Days}</span>
            </div>
          )}
          {club.Notes && (
            <div className="club-modal__detail">
              <span className="club-modal__detail-label">Notes</span>
              <span className="club-modal__detail-value">{club.Notes}</span>
            </div>
          )}
        </div>

        {onAddToSchedule && (
          <div className="club-modal__footer">
            <button
              type="button"
              className={`club-modal__add-btn ${added || isOnSchedule ? "club-modal__add-btn--added" : ""}`}
              onClick={handleAdd}
              disabled={isOnSchedule && !added}
            >
              {added ? (
                <>
                  <svg className="club-modal__check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9.5l3.5 3.5L14 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Added to Schedule
                </>
              ) : isOnSchedule ? (
                <>
                  <svg className="club-modal__check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M4 9.5l3.5 3.5L14 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  On Schedule
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Add to Schedule
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export function ClubCard({ club, onAddToSchedule, isOnSchedule }) {
  const [modalOpen, setModalOpen] = useState(false);
  const tags = getTags(club.Club_Tags);
  const hasIcon = club.Club_Icon_URL && club.Club_Icon_URL.trim() !== "";

  return (
    <>
      <article className={`club-card${isOnSchedule ? " club-card--scheduled" : ""}`} data-club-id={club.id}>
        <button
          type="button"
          className="club-card__trigger"
          onClick={() => setModalOpen(true)}
          aria-haspopup="dialog"
        >
          <div className="club-card__header">
            <div className="club-card__icon" aria-hidden="true">
              {hasIcon ? (
                <img src={club.Club_Icon_URL} alt="" loading="lazy" className="club-card__icon-img" />
              ) : (
                <span className="club-card__icon-fallback">{club.Club_Name.charAt(0)}</span>
              )}
            </div>
            <div className="club-card__title-wrap">
              <h2 className="club-card__title">{club.Club_Name}</h2>
              {tags.length > 0 && (
                <div className="club-card__tags" role="list">
                  {tags.map((tag) => (
                    <span key={tag} className="club-card__tag" role="listitem">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            {isOnSchedule ? (
              <span className="club-card__badge" aria-label="On schedule">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3.5 8.5l3 3L12.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            ) : (
              <span className="club-card__arrow" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
        </button>
      </article>

      {modalOpen && (
        <ClubModal
          club={club}
          isOnSchedule={isOnSchedule}
          onAddToSchedule={onAddToSchedule}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
