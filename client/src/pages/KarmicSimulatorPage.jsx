import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios.js';
import SiteFooter from '../components/SiteFooter.jsx';

// ── PurushArtha colour palette ────────────────────────────────────────
const PURUSHARTHA_CONFIG = {
  Dharma:  { color: '#f59e0b', glow: 'rgba(245,158,11,0.25)',  icon: '⚖️', label: 'Dharma',  subtitle: 'Path of Sacred Duty' },
  Artha:   { color: '#10b981', glow: 'rgba(16,185,129,0.25)',  icon: '🌿', label: 'Artha',   subtitle: 'Path of Material Prosperity' },
  Kama:    { color: '#ec4899', glow: 'rgba(236,72,153,0.25)',  icon: '🌸', label: 'Kama',    subtitle: 'Path of Desire & Passion' },
  Moksha:  { color: '#8b5cf6', glow: 'rgba(139,92,246,0.25)',  icon: '🪷', label: 'Moksha',  subtitle: 'Path of Liberation' },
};

const TYPE_BADGE = {
  deva: { label: 'Deva', bg: '#1e3a5f' },
  devi: { label: 'Devi', bg: '#4a1942' },
  hero: { label: 'Hero', bg: '#1e3d2f' },
  sage: { label: 'Sage', bg: '#3d2d1e' },
  asura: { label: 'Asura', bg: '#3d1e1e' },
  concept: { label: 'Concept', bg: '#1e2d3d' },
  avatar: { label: 'Avatar', bg: '#2d1e3d' },
};

// ── Animated loading spinner ──────────────────────────────────────────
function OracleSpinner() {
  return (
    <div className="karmic-spinner-wrap">
      <div className="karmic-mandala-ring karmic-ring-1" />
      <div className="karmic-mandala-ring karmic-ring-2" />
      <div className="karmic-mandala-ring karmic-ring-3" />
      <span className="karmic-spinner-icon">🔮</span>
      <p className="karmic-spinner-text">The Oracle reads the cosmic threads…</p>
    </div>
  );
}

// ── Single branch card ────────────────────────────────────────────────
function BranchCard({ branch, index }) {
  const cfg = PURUSHARTHA_CONFIG[branch.purushartha] || PURUSHARTHA_CONFIG.Dharma;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="karmic-branch-card"
      style={{
        '--branch-color': cfg.color,
        '--branch-glow': cfg.glow,
        animationDelay: `${index * 0.15}s`,
      }}
    >
      {/* Header */}
      <div className="karmic-branch-header">
        <span className="karmic-branch-icon">{cfg.icon}</span>
        <div>
          <div className="karmic-branch-path">{branch.path}</div>
          <div className="karmic-branch-subtitle">{cfg.subtitle}</div>
        </div>
        <span className="karmic-purushartha-badge">{branch.purushartha}</span>
      </div>

      {/* Headline */}
      <p className="karmic-branch-headline">"{branch.headline}"</p>

      {/* Guidance */}
      <p className="karmic-branch-guidance">{branch.guidance}</p>

      {/* Risk */}
      {branch.riskWarning && (
        <div className="karmic-risk-warning">
          <span>⚠️</span>
          <span>{branch.riskWarning}</span>
        </div>
      )}

      {/* Graph Nodes */}
      {branch.nodes?.length > 0 && (
        <div className="karmic-nodes-section">
          <div className="karmic-nodes-title">Mythic Guides on This Path</div>
          <div className="karmic-nodes-grid">
            {branch.nodes.map((node) => {
              const badge = TYPE_BADGE[node.type] || { label: node.type, bg: '#1e1e2f' };
              return (
                <Link
                  key={node.id}
                  to={`/?focus=${node.id}`}
                  className="karmic-node-chip"
                  style={{ '--node-color': cfg.color }}
                >
                  <span
                    className="karmic-node-badge"
                    style={{ background: badge.bg }}
                  >
                    {badge.label}
                  </span>
                  <span className="karmic-node-label">{node.label}</span>
                  {node.desc && (
                    <span className="karmic-node-desc">{node.desc}</span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Graph connections */}
          {branch.links?.length > 0 && (
            <div className="karmic-graph-ties">
              {branch.links.map((link, li) => (
                <div key={li} className="karmic-graph-tie-row">
                  <span className="karmic-tie-node">{link.source}</span>
                  <span className="karmic-tie-label">{link.label}</span>
                  <span className="karmic-tie-node">{link.target}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Mythological Parallel Card ────────────────────────────────────────
function ParallelCard({ parallel }) {
  return (
    <div className="karmic-parallel-card">
      <div className="karmic-parallel-label">The Oracle Sees A Mirror In Time</div>
      <h3 className="karmic-parallel-title">{parallel.title}</h3>
      <div className="karmic-parallel-character">
        <span className="karmic-parallel-avatar">👁️</span>
        <span>{parallel.character}</span>
      </div>
      <p className="karmic-parallel-summary">{parallel.summary}</p>

      {parallel.shloka?.translation && (
        <div className="karmic-parallel-shloka">
          {parallel.shloka.text && (
            <p className="karmic-shloka-sanskrit">{parallel.shloka.text}</p>
          )}
          <p className="karmic-shloka-translation">"{parallel.shloka.translation}"</p>
          {parallel.shloka.source && (
            <p className="karmic-shloka-source">— {parallel.shloka.source}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────
export default function KarmicSimulatorPage() {
  const navigate = useNavigate();
  const [dilemma, setDilemma] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const resultsRef = useRef(null);

  const EXAMPLE_DILEMMAS = [
    'Should I quit my stable corporate job to pursue my passion for music?',
    'My friend betrayed my trust. Should I forgive and maintain the relationship or walk away?',
    'I have a chance to earn more money but must compromise my values. What should I do?',
    'Should I move abroad for an opportunity or stay to care for my aging parents?',
  ];

  const handleSimulate = async (e) => {
    e?.preventDefault();
    const text = dilemma.trim();
    if (!text || text.length < 10) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post('/rishi/simulate', { dilemma: text });
      setResult(response.data);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'The oracle could not complete this simulation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (example) => {
    setDilemma(example);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setDilemma('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="karmic-page">
      {/* Cosmic background particles */}
      <div className="karmic-bg-particles" aria-hidden="true">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="karmic-particle" style={{
            '--delay': `${Math.random() * 8}s`,
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${Math.random() * 3 + 1}px`,
          }} />
        ))}
      </div>

      {/* Header */}
      <header className="karmic-header">
        <button className="btn btn-cancel" onClick={() => navigate('/')}>
          ← Return to Map
        </button>
        <div className="karmic-header-center">
          <div className="karmic-header-icon">🔮</div>
          <div>
            <h1 className="karmic-header-title">Karmic Simulator</h1>
            <p className="karmic-header-sub">Map your dilemma onto the cosmic branching of fate</p>
          </div>
        </div>
        <div style={{ width: '100px' }} />
      </header>

      {/* Input Section */}
      {!result && (
        <main className="karmic-input-section">
          <div className="karmic-intro-box">
            <h2 className="karmic-intro-title">Every Modern Dilemma Has a Mythic Mirror</h2>
            <p className="karmic-intro-body">
              The sages knew: human choices have always walked the same paths — Dharma, Artha, Kama, Moksha.
              Describe your crossroads below, and the Oracle will map it to the knowledge graph, 
              revealing which mythic figures walked your exact path and what they chose.
            </p>
          </div>

          <form className="karmic-form" onSubmit={handleSimulate}>
            <label className="karmic-form-label" htmlFor="dilemma-input">
              Describe your dilemma, O Seeker
            </label>
            <textarea
              id="dilemma-input"
              className="karmic-textarea"
              value={dilemma}
              onChange={(e) => setDilemma(e.target.value)}
              placeholder="e.g. Should I quit my stable job for a startup I believe in? I fear failure but feel constrained where I am…"
              rows={5}
              maxLength={800}
              disabled={loading}
            />
            <div className="karmic-char-count">{dilemma.length}/800</div>

            <button
              type="submit"
              className="karmic-submit-btn"
              disabled={loading || dilemma.trim().length < 10}
            >
              {loading ? 'Oracle is reading…' : '⚡ Reveal My Paths'}
            </button>
          </form>

          {/* Example dilemmas */}
          <div className="karmic-examples">
            <div className="karmic-examples-label">Or seek guidance on a common crossroads:</div>
            <div className="karmic-examples-grid">
              {EXAMPLE_DILEMMAS.map((ex, i) => (
                <button
                  key={i}
                  className="karmic-example-btn"
                  onClick={() => handleExample(ex)}
                  disabled={loading}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="karmic-error">
              <span>⚠️</span> {error}
            </div>
          )}
        </main>
      )}

      {/* Loading */}
      {loading && (
        <div className="karmic-loading-section">
          <OracleSpinner />
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div className="karmic-results" ref={resultsRef}>
          {/* Dilemma echo */}
          <div className="karmic-dilemma-echo">
            <span className="karmic-dilemma-label">The Seeker Asks:</span>
            <p className="karmic-dilemma-text">"{result.dilemma}"</p>
          </div>

          {/* Mythological parallel */}
          {result.mythologicalParallel && (
            <ParallelCard parallel={result.mythologicalParallel} />
          )}

          {/* Divider */}
          <div className="karmic-branches-title">
            <div className="karmic-branches-line" />
            <span>Choose Your Path</span>
            <div className="karmic-branches-line" />
          </div>

          {/* Branch cards */}
          <div className="karmic-branches-grid">
            {(result.branches || []).map((branch, i) => (
              <BranchCard key={i} branch={branch} index={i} />
            ))}
          </div>

          {/* Reset */}
          <div className="karmic-reset-wrap">
            <button className="karmic-reset-btn" onClick={handleReset}>
              🔄 Consult the Oracle Again
            </button>
            <Link to="/ask" className="karmic-ask-link">
              Ask the Rishi for deeper wisdom →
            </Link>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
