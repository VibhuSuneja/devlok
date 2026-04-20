// client/src/components/soul/StreakBar.jsx
import React from 'react';

export default function StreakBar({ current, longest }) {
  // A visual representation of the current streak
  // Show up to 7 dots. If streak > 7, highlight all and show a glowing effect.
  const visualMax = 7;
  const filledCount = Math.min(current, visualMax);
  
  return (
    <div className="soul-streak-bar">
      <div className="soul-streak-header">
        <span className="soul-streak-title">Current Phase Devotion</span>
        <span className="soul-streak-count">{current} <small>Days</small></span>
      </div>
      
      <div className="soul-streak-visual">
        {Array.from({ length: visualMax }).map((_, i) => (
          <div 
            key={i} 
            className={`soul-streak-dot ${i < filledCount ? 'soul-streak-dot--filled' : ''} ${current >= visualMax && i === visualMax - 1 ? 'soul-streak-dot--glowing' : ''}`}
          />
        ))}
        {current > visualMax && (
           <span className="soul-streak-plus">+{current - visualMax}</span>
        )}
      </div>

      <div className="soul-streak-footer">
        <span>Longest unbroken thread: <strong>{longest}</strong> days</span>
      </div>

      <style>{`
        .soul-streak-bar {
          background: rgba(212,151,58,.03);
          border: 1px solid rgba(212,151,58,.1);
          border-radius: 8px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .soul-streak-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .soul-streak-title {
          font-size: .65rem;
          letter-spacing: .15em;
          text-transform: uppercase;
          color: var(--text-dim);
        }
        .soul-streak-count {
          font-family: 'Cinzel Decorative', serif;
          font-size: 1.2rem;
          color: var(--amber-glow);
        }
        .soul-streak-count small {
          font-size: .6rem;
          font-family: 'Inter', sans-serif;
          color: var(--text-dim);
          letter-spacing: .1em;
        }
        .soul-streak-visual {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .soul-streak-dot {
          flex: 1;
          height: 6px;
          background: rgba(212,151,58,.1);
          border-radius: 3px;
          transition: all 0.3s;
        }
        .soul-streak-dot--filled {
          background: var(--amber-dim);
          box-shadow: 0 0 8px rgba(240,184,74,.3);
        }
        .soul-streak-dot--glowing {
          background: var(--amber);
          box-shadow: 0 0 12px rgba(240,184,74,.8);
        }
        .soul-streak-plus {
          font-size: .75rem;
          font-weight: bold;
          color: var(--amber-dim);
        }
        .soul-streak-footer {
          font-size: .7rem;
          color: rgba(232,213,163,.6);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
