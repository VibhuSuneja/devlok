import React from 'react';

const YC = {
  eternal: 'rgba(212,151,58,.5)',
  satya: 'rgba(92,184,138,.5)',
  treta: 'rgba(92,138,196,.5)',
  dvapara: 'rgba(154,110,212,.5)',
  kali: 'rgba(196,92,92,.5)'
};

const YL = {
  eternal: 'Eternal',
  satya: 'Satya Yuga',
  treta: 'Treta Yuga',
  dvapara: 'Dvāpara Yuga',
  kali: 'Kali Yuga'
};

function Tooltip({ node, x, y, visible }) {
  if (!node) return null;

  return (
    <div 
      className={`tooltip ${visible ? 'visible' : ''}`}
      style={{ left: x + 15, top: y - 10 }}
    >
      <div className="tooltip-name">{node.label}</div>
      <div 
        className="tooltip-yuga" 
        style={{ color: YC[node.yuga] || 'var(--text-dim)' }}
      >
        {YL[node.yuga] || ''}
      </div>
      <div className="tooltip-desc">
        {(node.epithets || []).slice(0, 2).join(' · ')}
      </div>
    </div>
  );
}

export default Tooltip;
