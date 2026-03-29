import React from 'react';

const TYPES = ['all', 'deva', 'devi', 'hero', 'asura', 'sage', 'celestial', 'avatar', 'darshana'];
const LINK_TYPES = ['all', 'family', 'divine', 'conflict', 'guru', 'alliance', 'manifestation', 'darshana'];

function FilterBar({ filter, setFilter, linkFilter, setLinkFilter }) {
  return (
    <div className="filter-manager">
      <div className="filter-stack">
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
      </div>
      <div className="filter-stack">
        <div className="filter-group filter-group--links">
          <span className="filter-label">Relation:</span>
          {LINK_TYPES.map(lt => (
            <button 
              key={lt} 
              className={`filter-btn filter-btn--small ${linkFilter === lt ? 'active' : ''}`}
              onClick={() => setLinkFilter(lt)}
            >
              {lt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
