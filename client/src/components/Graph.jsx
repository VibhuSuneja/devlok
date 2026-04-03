import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const COLORS = {
  deva: '#d4973a',       // Amber
  devi: '#c45c8a',       // Lotus
  hero: '#5c8ac4',       // Dharma
  asura: '#c45c5c',      // Destroy
  sage: '#5cb88a',       // Sacred
  celestial: '#9a6ed4',  // Celestial
  avatar: '#ffab00',     // Divine Saffron
  darshana: '#a0c4dc',   // Steel-blue ice — pure concept
};

// ── Octagon polygon points for a given radius, centered at origin ────────────
function octagonPoints(r) {
  const n = 8;
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i / n) - (Math.PI / 8); // flat-top orientation
    return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
  }).join(' ');
}

function Graph({ data, onSelectNode, onHoverNode, selectedNodeId, searchQuery, linkFilter, activeArcNodes }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const gRef = useRef(null);

  useEffect(() => {
    if (!data.nodes.length) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // ── Detect touch-primary device ────────────────────────────────────────────
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = window.innerWidth < 768;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Main container group for zoom/pan
    const g = svg.append('g');
    gRef.current = g.node();

    // ── Zoom behaviour ─────────────────────────────────────────────────────────
    // CRITICAL: Do NOT call svg.on('touchstart', e => e.preventDefault()) at the
    // SVG level — that intercepts multi-touch pinch before D3 zoom sees it.
    // D3's zoom() handles pinch natively via pointer events.
    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    // Initial transform — zoomed out more on mobile to show the full graph
    const initialScale = isMobile ? 0.42 : 1.1;
    svg.call(zoom.transform, d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(initialScale));

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(120).strength(1))
      .force('charge', d3.forceManyBody().strength(isMobile ? -180 : -400))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(d => d.size + (isMobile ? 18 : 25)));

    simulationRef.current = simulation;

    // Define arrowhead
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', 'rgba(232,213,163,.15)');

    const linkGroup = g.append('g');
    const nodeGroup = g.append('g');

    const link = linkGroup
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', l => l.type === 'darshana' ? 'rgba(160,196,220,.35)' : 'rgba(232,213,163,.15)')
      .attr('stroke-width', l => l.type === 'darshana' ? 2 : 1.5)
      .attr('stroke-dasharray', l => l.type === 'darshana' ? '6,3' : null)
      .attr('marker-end', 'url(#arrow)');

    const node = nodeGroup
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node-group')
      // ── Larger invisible hit-target so fat fingers can tap reliably ──────────
      .style('cursor', 'pointer');

    // ── MOUSE events (desktop only) ────────────────────────────────────────────
    if (!isTouchDevice) {
      node
        .on('click', (e, d) => {
          if (e.defaultPrevented) return;
          e.stopPropagation();
          onSelectNode(d.id);
        })
        .on('mouseover', (e, d) => {
          onHoverNode({ visible: true, x: e.clientX, y: e.clientY, node: d });
          node.style('opacity', n => {
            const conn = data.links.some(l =>
              (l.source.id === d.id && l.target.id === n.id) ||
              (l.target.id === d.id && l.source.id === n.id) ||
              n.id === d.id
            );
            return conn ? 1 : 0.1;
          });
          link.style('opacity', l =>
            (l.source.id === d.id || l.target.id === d.id) ? 0.8 : 0.03
          );
        })
        .on('mousemove', (e) => {
          onHoverNode(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
        })
        .on('mouseout', () => {
          onHoverNode({ visible: false, x: 0, y: 0, node: null });
          node.style('opacity', 1);
          link.style('opacity', null);
        });
    }

    // ── TOUCH events (mobile / tablet) ────────────────────────────────────────
    // Tap-to-select: fire onSelectNode only if the touch was short (< 250ms)
    // and the finger barely moved (≤ 8px). This distinguishes tap from drag/pan.
    if (isTouchDevice) {
      node.each(function(d) {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        d3.select(this)
          .on('touchstart', function(e) {
            // Allow the event to propagate so D3 drag still works for this node
            touchStartTime = Date.now();
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
          }, { passive: true })
          .on('touchend', function(e) {
            e.stopPropagation();
            const dt = Date.now() - touchStartTime;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Short tap with minimal movement = node selection
            if (dt < 250 && dist < 8) {
              onSelectNode(d.id);
            }
          }, { passive: true });
      });
    }

    // ── Per-node drag (works on both mouse and touch via D3) ──────────────────
    node.call(
      d3.drag()
        .on('start', (event, d) => {
          // Prevent page scroll while dragging a node on touch
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
            // Set touch-action:none dynamically only on the dragged node element
            event.sourceEvent.currentTarget &&
              (event.sourceEvent.currentTarget.style.touchAction = 'none');
          }
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
          if (event.sourceEvent?.currentTarget) {
            event.sourceEvent.currentTarget.style.touchAction = '';
          }
        })
    );

    // ── Outer glow ring (circle for beings, octagon for darshana) ────────────
    const regularNodes = node.filter(d => d.type !== 'darshana');
    const darshanaNodes = node.filter(d => d.type === 'darshana');

    regularNodes.append('circle')
      .attr('class', 'node-ring')
      .attr('r', d => d.size + 6)
      .attr('fill', 'none')
      .attr('stroke', d => COLORS[d.type] || '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'blur(3px)');

    darshanaNodes.append('polygon')
      .attr('class', 'node-ring')
      .attr('points', d => octagonPoints(d.size + 8))
      .attr('fill', 'none')
      .attr('stroke', COLORS.darshana)
      .attr('stroke-width', 2)
      .style('filter', 'blur(2px)');

    // ── Inner glow ────────────────────────────────────────────────────────────
    regularNodes.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => COLORS[d.type] || '#fff')
      .attr('opacity', .15);

    darshanaNodes.append('polygon')
      .attr('points', d => octagonPoints(d.size))
      .attr('fill', COLORS.darshana)
      .attr('opacity', .15);

    // ── Main shape ────────────────────────────────────────────────────────────
    // On touch devices: skip drop-shadow filter (GPU-expensive) and use a
    // slightly more opaque fill instead so nodes still pop visually.
    regularNodes.append('circle')
      .attr('r', d => d.size * .6)
      .attr('fill', d => COLORS[d.type] || '#fff')
      .style('filter', isTouchDevice ? null : 'drop-shadow(0 0 8px currentColor)');

    darshanaNodes.append('polygon')
      .attr('points', d => octagonPoints(d.size * .6))
      .attr('fill', COLORS.darshana)
      .style('filter', isTouchDevice
        ? null
        : `drop-shadow(0 0 12px ${COLORS.darshana})`);

    // ── Large invisible hit-area for touch (makes nodes easy to tap) ──────────
    if (isTouchDevice) {
      node.append('circle')
        .attr('r', d => Math.max(d.size + 10, 22))
        .attr('fill', 'transparent')
        .attr('stroke', 'none');
    }

    // ── Sanskrit/Label below node ─────────────────────────────────────────────
    node.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.size + 16)
      .attr('font-size', d => Math.max(isMobile ? 8 : 9, d.size * .5))
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Background click/tap to deselect
    svg.on('click', (e) => {
      if (e.target === svgRef.current) onSelectNode(null);
    });

    return () => simulation.stop();
  }, [data, onSelectNode]);

  // Handle selectedNode highlighting
  useEffect(() => {
    if (!gRef.current) return;
    d3.select(gRef.current).selectAll('.node-group')
      .selectAll('.node-ring')
      .style('opacity', d => d.id === selectedNodeId ? 1 : 0);
    
    d3.select(gRef.current).selectAll('.node-group')
      .selectAll('.node-label')
      .style('fill', d => d.id === selectedNodeId ? '#f0b84a' : '#e8d5a3')
      .style('font-weight', d => d.id === selectedNodeId ? 'bold' : 'normal');

    d3.select(gRef.current).selectAll('.link')
      .style('stroke', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 'rgba(212,151,58,.5)' : null)
      .style('stroke-opacity', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 1 : null)
      .style('stroke-width', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 2.5 : null);
  }, [selectedNodeId]);

  useEffect(() => {
    if (!gRef.current) return;
    const q = (searchQuery || '').toLowerCase().trim();

    // First, find all nodes that match the query directly, and their neighbors
    let matchedNodeIds = new Set();
    if (q) {
      data.nodes.forEach(d => {
        const match = d.label.toLowerCase().includes(q) ||
          (d.epithets||[]).some(e => e.toLowerCase().includes(q)) ||
          (d.desc||'').toLowerCase().includes(q) ||
          (d.sanskrit||'').toLowerCase().includes(q);
        if (match) {
          matchedNodeIds.add(d.id);
          // Add 1st degree connections so they stay illuminated
          data.links.forEach(l => {
            if (l.source.id === d.id) matchedNodeIds.add(l.target.id);
            if (l.target.id === d.id) matchedNodeIds.add(l.source.id);
          });
        }
      });
    }

    d3.select(gRef.current).selectAll('.node-group')
      .style('opacity', d => {
        if (activeArcNodes) {
          return activeArcNodes.includes(d.id) ? 1 : 0.05;
        }
        if (!q) {
          // If relationship filter is on, only show nodes connected by that link type
          if (linkFilter !== 'all') {
            const hasLink = data.links.some(l => 
              l.type === linkFilter && (l.source.id === d.id || l.target.id === d.id)
            );
            return hasLink ? 1 : 0.08;
          }
          return 1;
        }
        return matchedNodeIds.has(d.id) ? 1 : 0.08;
      });

    d3.select(gRef.current).selectAll('.link')
      .style('opacity', l => {
        if (activeArcNodes) {
          return (activeArcNodes.includes(l.source.id) && activeArcNodes.includes(l.target.id)) ? 0.8 : 0.02;
        }
        if (linkFilter === 'all') {
          if (q) {
            return (matchedNodeIds.has(l.source.id) && matchedNodeIds.has(l.target.id)) ? 0.6 : 0.03;
          }
          return null;
        }
        return l.type === linkFilter ? 1 : 0.03;
      })
      .style('stroke-width', l => {
        if (activeArcNodes) {
          return (activeArcNodes.includes(l.source.id) && activeArcNodes.includes(l.target.id)) ? 2 : 1;
        }
        if (linkFilter === 'all') return 1.5;
        return l.type === linkFilter ? 2.5 : 1;
      });
  }, [searchQuery, linkFilter, data.links, data.nodes, activeArcNodes]);

  return (
    <div className="graph-container">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}

export default Graph;
