export function SearchAndFilter({ searchQuery, onSearchChange, selectedTags, allTags, onTagToggle }) {
  return (
    <div className="search-and-filter">
      <label htmlFor="club-search" className="search-and-filter__label">
        Search clubs by name
      </label>
      <input
        id="club-search"
        type="search"
        className="search-and-filter__input"
        placeholder="Type to search…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        autoComplete="off"
        aria-describedby="club-search-desc"
      />
      <p id="club-search-desc" className="sr-only">
        Filters the list of clubs below by name.
      </p>

      <fieldset className="search-and-filter__tags">
        <legend className="search-and-filter__legend">Filter by tag</legend>
        <div className="search-and-filter__tag-list" role="group">
          {allTags.map((tag) => (
            <label key={tag} className="search-and-filter__tag-label">
              <input
                type="checkbox"
                checked={selectedTags.includes(tag)}
                onChange={() => onTagToggle(tag)}
                className="search-and-filter__checkbox"
              />
              <span className="search-and-filter__tag-text">{tag}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
