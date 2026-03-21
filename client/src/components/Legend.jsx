import React from 'react';

const COLORS = {
  deva: '#d4973a',
  devi: '#c45c8a',
  hero: '#5c8ac4',
  asura: '#c45c5c',
  sage: '#5cb88a',
  celestial: '#9a6ed4',
  avatar: '#ffab00',
};

function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Entity Essence</div>
      <div className="legend-items">
        {Object.entries(COLORS).map(([type, color]) => (
          <div key={type} className="legend-item" style={{ color }}>
            <span className="legend-dot" style={{ background: color }} />
            {type.toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Legend;
