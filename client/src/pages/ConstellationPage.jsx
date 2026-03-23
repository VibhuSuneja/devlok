import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../api/axios.js';
import Graph from '../components/Graph.jsx';
import Loader from '../components/Loader.jsx';
import DetailPanel from '../components/DetailPanel.jsx';
import Tooltip from '../components/Tooltip.jsx';
import posthog from 'posthog-js';

// ── Animated star canvas ───────────────────────────────────────────────────────
function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars with random brightness levels
    const stars = Array.from({ length: 280 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.008 + 0.003,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;
      stars.forEach(s => {
        const alpha = s.alpha + Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.25;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 200, ${Math.max(0, Math.min(1, alpha))})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="constellation-starfield" />;
}

// ── Sanskrit floating glyphs ───────────────────────────────────────────────────
const GLYPHS = ['ॐ', 'ॐ', 'ॐ', '𑖌𑖼', '𑀬', 'श्री', 'ॐ', '✦', '✧', '•'];
function FloatingGlyphs({ count = 12 }) {
  const glyphs = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      glyph: GLYPHS[i % GLYPHS.length],
      left: `${5 + (i * 8.5) % 90}%`,
      delay: `${(i * 0.7) % 6}s`,
      duration: `${12 + (i * 3.1) % 10}s`,
      size: `${0.9 + (i * 0.15) % 1.1}rem`,
      opacity: 0.08 + (i * 0.025) % 0.12,
    })), [count]);

  return (
    <div className="constellation-glyphs" aria-hidden="true">
      {glyphs.map(g => (
        <span
          key={g.id}
          className="constellation-glyph"
          style={{
            left: g.left,
            animationDelay: g.delay,
            animationDuration: g.duration,
            fontSize: g.size,
            opacity: g.opacity,
          }}
        >
          {g.glyph}
        </span>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ConstellationPage() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const unselectTimerRef = useRef(null);
  const [searchParams] = useSearchParams();

  const constellationIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').filter(Boolean) : [];
  }, [searchParams]);

  useEffect(() => {
    axios.get('/graph')
      .then(res => setData(res.data))
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
    return () => {
      if (unselectTimerRef.current) clearTimeout(unselectTimerRef.current);
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!constellationIds.length) return data;
    const bookmarkedSet = new Set(constellationIds);
    const nodes = data.nodes.filter(n => bookmarkedSet.has(n.id));
    const links = data.links.filter(l =>
      bookmarkedSet.has(l.source?.id || l.source) &&
      bookmarkedSet.has(l.target?.id || l.target)
    );
    return { nodes, links };
  }, [data, constellationIds]);

  const selectedNode = useMemo(() =>
    data.nodes.find(n => n.id === selectedNodeId),
  [data.nodes, selectedNodeId]);

  const relatedLinks = useMemo(() =>
    selectedNodeId ? data.links.filter(l =>
      (l.source?.id || l.source) === selectedNodeId ||
      (l.target?.id || l.target) === selectedNodeId
    ) : [],
  [data.links, selectedNodeId]);

  const handleSelectNode = useCallback((id) => {
    if (unselectTimerRef.current) {
      clearTimeout(unselectTimerRef.current);
      unselectTimerRef.current = null;
    }
    if (id) posthog.capture('constellation_node_clicked', { node_id: id });
    setSelectedNodeId(id);
    setIsPanelOpen(!!id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    unselectTimerRef.current = setTimeout(() => {
      setSelectedNodeId(null);
      unselectTimerRef.current = null;
    }, 2000);
  }, []);

  const linkCount = filteredData.links.length;

  return (
    <div className="constellation-root">
      <Loader visible={loading} />

      {/* Cosmic background layers */}
      <StarField />
      <FloatingGlyphs count={14} />
      <div className="constellation-nebula" />
      <div className="constellation-nebula constellation-nebula--2" />

      {/* ── Top HUD ────────────────────────────────────────────────── */}
      <div className="constellation-hud">
        {/* Left: Back */}
        <Link to="/profile" className="constellation-hud-back">
          <span className="constellation-hud-back-arrow">←</span>
          <span>Exit</span>
        </Link>

        {/* Center: Title */}
        <div className="constellation-hud-center">
          <span className="constellation-hud-glyph">✦</span>
          <div>
            <h1 className="constellation-hud-title">Your Divine Constellation</h1>
            <p className="constellation-hud-subtitle">
              {constellationIds.length} Sacred Beings · {linkCount} Divine Connections
            </p>
          </div>
          <span className="constellation-hud-glyph">✦</span>
        </div>

        {/* Right: Stat pills */}
        <div className="constellation-hud-stats">
          <div className="constellation-stat-pill">
            <span className="constellation-stat-num">{constellationIds.length}</span>
            <span className="constellation-stat-label">Beings</span>
          </div>
          <div className="constellation-stat-pill">
            <span className="constellation-stat-num">{linkCount}</span>
            <span className="constellation-stat-label">Bonds</span>
          </div>
        </div>
      </div>

      {/* ── Graph canvas ─────────────────────────────────────────── */}
      <div className="constellation-graph-wrap">
        <Graph
          data={filteredData}
          onSelectNode={handleSelectNode}
          onHoverNode={setTooltip}
          selectedNodeId={selectedNodeId}
          searchQuery=""
          linkFilter="all"
        />
      </div>

      {/* ── Bottom Sanskrit bar ───────────────────────────────────── */}
      <div className="constellation-footer-bar">
        <span className="constellation-footer-text">
          ॐ तत् सत् · Your Sacred Constellation · ॐ तत् सत्
        </span>
      </div>

      {/* Panel & Tooltip */}
      <DetailPanel
        node={isPanelOpen ? selectedNode : null}
        links={relatedLinks}
        allNodes={data.nodes}
        onClose={handleClosePanel}
        onSelectNode={handleSelectNode}
      />
      <Tooltip
        node={tooltip.node}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
      />
    </div>
  );
}
