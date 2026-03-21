import React from 'react';
import posthog from 'posthog-js';

const YUGAS = [
  { id: 'all', name: 'All Yugas', sub: 'Complete Cosmos', yrs: 'Eternal' },
  { id: 'satya', name: 'Satya', sub: 'The Age of Truth', yrs: '1.72M Yrs' },
  { id: 'treta', name: 'Treta', sub: 'The Age of Three', yrs: '1.29M Yrs' },
  { id: 'dvapara', name: 'Dvapara', sub: 'The Age of Two', yrs: '864k Yrs' },
  { id: 'kali', name: 'Kali', sub: 'The Age of Darkness', yrs: '432k Yrs' },
];

function YugaTimeline({ activeYuga, setYuga }) {
  return (
    <div className="yuga-bar">
      <div className="yuga-inner">
        <div className="yuga-title">Cosmic Epochs</div>
        <div className="yuga-segs">
          {YUGAS.map(y => (
            <div 
              key={y.id} 
              className={`yuga-seg ${activeYuga === y.id ? 'active' : ''}`}
              onClick={() => {
                setYuga(y.id);
                posthog.capture('yuga_filter_used', { yuga: y.id });
              }}
            >
              <span className="yuga-seg-name">{y.name}</span>
              <span className="yuga-seg-sub">{y.sub}</span>
              <div className="yuga-seg-yrs">{y.yrs}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default YugaTimeline;
