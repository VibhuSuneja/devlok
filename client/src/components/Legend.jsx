import React from 'react';
import { NODE_COLORS } from '../utils/graphTaxonomy.js';

function Legend() {
  return (
    <div className="legend">
      <div className="legend-title">Entity Essence</div>
      <div className="legend-items">
        {Object.entries(NODE_COLORS).map(([type, color]) => {
          const polygonal = ['darshana', 'concept', 'text'].includes(type);

          return (
            <div key={type} className="legend-item" style={{ color }}>
              <span
                className="legend-dot"
                style={{
                  background: color,
                  clipPath: polygonal
                    ? 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'
                    : 'none',
                  borderRadius: polygonal ? '0' : '50%',
                }}
              />
              {type.toUpperCase()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Legend;
