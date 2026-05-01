export function SearchAndFilter({ searchQuery, onSearchChange, selectedTags, allTags, onTagToggle }) {
  return (
    <div className="search-and-filter">
      <div className="search-and-filter__search">
        <svg className="search-and-filter__search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.75"/>
          <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
        <input
          id="club-search"
          type="search"
          className="search-and-filter__input"
          placeholder="Search by club name…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
          aria-label="Search clubs by name"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-and-filter__clear"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      <div className="search-and-filter__tag-row" role="group" aria-label="Filter by category">
        <span className="search-and-filter__tag-label-prefix">Categories</span>
        <div className="search-and-filter__tag-scroll">
          {allTags.map((tag) => {
            const selected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`search-and-filter__chip${selected ? " search-and-filter__chip--selected" : ""}`}
                onClick={() => onTagToggle(tag)}
                aria-pressed={selected}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
