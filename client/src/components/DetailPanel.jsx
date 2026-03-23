import React, { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useBookmarks } from '../hooks/useBookmarks.js';
import { useSound } from '../hooks/useSound.js';

const COLORS = {
  deva: '#d4973a',
  devi: '#c45c8a',
  hero: '#5c8ac4',
  asura: '#c45c5c',
  sage: '#5cb88a',
  celestial: '#9a6ed4',
  avatar: '#ffab00',
};

// Returns the correct label from the perspective of currentNodeId
// If currentNode is the source, use the label as-is.
// If currentNode is the target, return the semantic inverse.
function getEffectiveLabel(link, currentNodeId, otherNode) {
  const isSource = (link.source?.id || link.source) === currentNodeId;
  if (isSource) return link.label;

  // Target-side: compute the inverse label
  const otherType = otherNode?.type;
  const otherIsDevi = otherType === 'devi';
  // For "Son of" inversion: the "other" node (the source) is the parent.
  // Determine if parent is likely female (devi) to say "Mother of" vs "Father of".
  const otherIsDeviSource = otherIsDevi;

  const childLabel = otherIsDevi ? 'Daughter' : 'Son';
  const parentLabel = otherIsDeviSource ? 'Mother of' : 'Father of';

  const INVERSE_MAP = {
    // Spousal
    'Husband':          'Wife',
    'Wife of':          'Husband of',
    'Consort':          'Consort',
    'First Consort':    'First Consort',
    'Divine Love':      'Divine Love',
    // Parentage
    'Father':           childLabel,
    'Mother':           childLabel,
    'Son of':           parentLabel,
    'Grandfather':      'Grandchild',
    // Siblings (symmetric)
    'Brother':          'Brother',
    'Half-brother':     'Half-brother',
    // Spiritual
    'Guru':             'Student',
    'Family Guru':      'Student',
    'Avatar':           'Incarnation of',
    // Actions (conflict)
    'Slays':            'Slain by',
    'Slain by':         'Slays',
    'Abducts':          'Abducted by',
    'Fell to':          'Defeated',
    'Seduces':          'Seduced by',
    'Cursed':           'Cursed by',
    'Curses':           'Cursed by',
    'Cursed by':        'Cursed',
    'Fought':           'Fought by',
    'Enemies':          'Enemies',
    'Rivals':           'Rivals',
    // Divine roles
    'Charioteer':       'Rider',
    'Vehicle':          'Rider',
    'Devoted to':       'Devotee',
    'Manifestation':    'Manifested into',
    'Manifestation of': 'Divine Source',
    'Born from':        'Source',
    'Reborn as':        'Previous life',
    'Scribe for':       'Author',
    // Alliance
    'Allied with':      'Allied with',
    'Loyal to':         'Receives loyalty from',
    'Commander':        'Commanded by',
    // Specific acts
    'Sheltered':        'Sheltered by',
    'Inspired':         'Inspired by',
    'Blessed':          'Blessed by',
    'Gave mantra':      'Received mantra from',
    'Died protecting':  'Protected by',
    'Demanded thumb':   'Gave thumb to',
    'Vamana defeats':   'Defeated by Vamana',
    'Built Lanka for':  'Built by Vishwakarma',
    'Built Dwarka for': 'Built by Vishwakarma',
    'Trinity':          'Trinity',
  };

  return INVERSE_MAP[link.label] ?? link.label;
}

function DetailPanel({ node, links, allNodes, onClose, onSelectNode }) {
  const [copied, setCopied] = React.useState(false);
  const [showLoginHint, setShowLoginHint] = React.useState(false);
  const { isLoggedIn } = useContext(AuthContext);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { playSound } = useSound();
  const prevNodeId = useRef(null);

  // Play bell when a new node opens
  useEffect(() => {
    if (node && node.id !== prevNodeId.current) {
      prevNodeId.current = node.id;
      playSound('node_click');
    }
    if (!node) prevNodeId.current = null;
  }, [node, playSound]);

  const bookmarked = node ? isBookmarked(node.id) : false;
  
  const handleShare = () => {
    if (!node) return;
    navigator.clipboard.writeText(`${window.location.origin}/character/${node.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = async () => {
    if (!node) return;
    if (!isLoggedIn) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 2500);
      return;
    }
    const wasBookmarked = bookmarked;
    const result = await toggleBookmark(node.id);
    if (result?.success) {
      if (!wasBookmarked) {
        playSound('bookmark');
        // Small delay then play shraddha chime for points
        setTimeout(() => playSound('shraddha'), 300);
      } else {
        playSound('unbookmark');
      }
    }
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
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', position: 'relative' }}>
                {showLoginHint && (
                  <span className="bookmark-login-hint">Sign in to bookmark</span>
                )}
                <button
                  className={`bookmark-btn ${bookmarked ? 'bookmarked' : ''}`}
                  onClick={handleBookmark}
                  title={isLoggedIn ? (bookmarked ? 'Remove bookmark' : 'Bookmark this being') : 'Sign in to bookmark'}
                  aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
                >
                  {bookmarked ? '★' : '☆'}
                </button>
                <button 
                  className="filter-btn" 
                  style={{ borderColor: '#d4973a', color: '#d4973a', fontSize: '0.75rem', padding: '0.2rem 0.6rem', letterSpacing: '1px', textTransform: 'uppercase', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}
                  onClick={handleShare}
                >
                  {copied ? 'Copied!' : '↗ Share'}
                </button>
              </div>
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
                      <span className="relation-type">{getEffectiveLabel(l, node.id, otherNode)}</span>
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
