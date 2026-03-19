import React from 'react';

const TYPES = ['all', 'deva', 'devi', 'hero', 'asura', 'sage', 'celestial'];

function FilterBar({ filter, setFilter }) {
  return (
    <div className="filter-group">
      <span className="filter-label">Essence:</span>
      {TYPES.map(t => (
        <button 
          key={t} 
          className={`filter-btn ${filter === t ? 'active' : ''}`}
          onClick={() => setFilter(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;
