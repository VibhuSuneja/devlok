import React from 'react';

const COLORS = {
  deva: '#d4973a',
  devi: '#c45c8a',
  hero: '#5c8ac4',
  asura: '#c45c5c',
  sage: '#5cb88a',
  celestial: '#9a6ed4',
};

function DetailPanel({ node, links, allNodes, onClose, onSelectNode }) {
  const [copied, setCopied] = React.useState(false);
  
  const handleShare = () => {
    if (!node) return;
    navigator.clipboard.writeText(`${window.location.origin}/character/${node.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`detail-panel ${node ? 'open' : ''}`}>
      <button className="panel-close" style={{ zIndex: 10, fontSize: '1.2rem', width: '32px', height: '32px' }} onClick={onClose}>×</button>
      
      {node && (
        <>
          <div className="panel-header">
            <div className="panel-yuga-badge" style={{ color: COLORS[node.type] }}> {node.yuga} yuga </div>
            <div className="panel-type-badge" style={{ color: COLORS[node.type] }}> {node.type} </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <h2 className="panel-name" style={{ margin: 0 }}>{node.label}</h2>
              <button 
                className="filter-btn" 
                style={{ borderColor: '#d4973a', color: '#d4973a', fontSize: '0.75rem', padding: '0.2rem 0.6rem', letterSpacing: '1px', textTransform: 'uppercase', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                onClick={handleShare}
              >
                {copied ? 'Copied!' : '↗ Share'}
              </button>
            </div>
            <div className="panel-sanskrit">{node.sanskrit}</div>
            
            <div className="panel-epithets">
              {node.epithets?.map(e => (
                <span key={e} className="epithet-tag" style={{ color: COLORS[node.type], borderColor: `${COLORS[node.type]}44` }}>
                  {e}
                </span>
              ))}
            </div>
          </div>

          <div className="panel-body">
            <div className="panel-section">
              <h3 className="panel-section-title">ORIGIN & ESSENCE</h3>
              <p className="panel-desc">{node.desc}</p>
            </div>

            {node.source && (
              <div className="panel-section">
                <h3 className="panel-section-title">CHRONICLES (SOURCES)</h3>
                <div className="panel-source">{node.source}</div>
              </div>
            )}

            <div className="panel-section">
              <h3 className="panel-section-title">SACRED CONNECTIONS</h3>
              <div className="relation-list">
                {links?.map(l => {
                  const other = (l.source?.id || l.source) === node.id ? (l.target?.id || l.target) : (l.source?.id || l.source);
                  const otherNode = allNodes.find(n => n.id === other);
                  if (!otherNode) return null;

                  return (
                    <div 
                      key={l._id || l.id} 
                      className="relation-item" 
                      onClick={() => onSelectNode(otherNode.id)}
                    >
                      <span className="relation-dot" style={{ background: COLORS[otherNode.type] }} />
                      <span className="relation-type">{l.label}</span>
                      <span className="relation-name">{otherNode.label}</span>
                      <span className="relation-arrow">→</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DetailPanel;
