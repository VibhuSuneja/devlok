import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getNodeColor } from '../utils/graphTaxonomy.js';

function octagonPoints(r) {
  const n = 8;
  return Array.from({ length: n }, (_, i) => {
    const angle = (2 * Math.PI * i / n) - (Math.PI / 8);
    return `${r * Math.cos(angle)},${r * Math.sin(angle)}`;
  }).join(' ');
}

function isKnowledgeNode(type) {
  return ['darshana', 'concept', 'text'].includes(type);
}

function Graph({ data, onSelectNode, onHoverNode, selectedNodeId, searchQuery, linkFilter, activeArcNodes }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);

  useEffect(() => {
    if (!data.nodes.length) return undefined;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
    const isMobile = width < 768;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');
    gRef.current = g.node();

    const zoom = d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);
    svg.call(
      zoom.transform,
      d3.zoomIdentity.translate(width / 2, height / 2).scale(isMobile ? 0.42 : 1.1),
    );

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id((d) => d.id).distance(120).strength(1))
      .force('charge', d3.forceManyBody().strength(isMobile ? -180 : -400))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius((d) => d.size + (isMobile ? 18 : 25)));

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

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', (l) => ['darshana', 'conceptual', 'textual'].includes(l.type) ? 'rgba(160,196,220,.35)' : 'rgba(232,213,163,.15)')
      .attr('stroke-width', (l) => ['darshana', 'conceptual', 'textual'].includes(l.type) ? 2 : 1.5)
      .attr('stroke-dasharray', (l) => ['darshana', 'conceptual', 'textual'].includes(l.type) ? '6,3' : null)
      .attr('marker-end', 'url(#arrow)');

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node-group')
      .style('cursor', 'pointer');

    if (!isTouchDevice) {
      node
        .on('click', (e, d) => {
          if (e.defaultPrevented) return;
          e.stopPropagation();
          onSelectNode(d.id);
        })
        .on('mouseover', (e, d) => {
          onHoverNode({ visible: true, x: e.clientX, y: e.clientY, node: d });
          node.style('opacity', (n) => {
            const connected = data.links.some((l) =>
              (l.source.id === d.id && l.target.id === n.id) ||
              (l.target.id === d.id && l.source.id === n.id) ||
              n.id === d.id);
            return connected ? 1 : 0.1;
          });
          link.style('opacity', (l) => (l.source.id === d.id || l.target.id === d.id ? 0.8 : 0.03));
        })
        .on('mousemove', (e) => onHoverNode((prev) => ({ ...prev, x: e.clientX, y: e.clientY })))
        .on('mouseout', () => {
          onHoverNode({ visible: false, x: 0, y: 0, node: null });
          node.style('opacity', 1);
          link.style('opacity', null);
        });
    } else {
      node.each(function attachTouch(d) {
        let touchStartTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        d3.select(this)
          .on('touchstart', function onTouchStart(e) {
            touchStartTime = Date.now();
            const t = e.touches[0];
            touchStartX = t.clientX;
            touchStartY = t.clientY;
          }, { passive: true })
          .on('touchend', function onTouchEnd(e) {
            e.stopPropagation();
            const dt = Date.now() - touchStartTime;
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartX;
            const dy = t.clientY - touchStartY;
            if (dt < 250 && Math.sqrt(dx * dx + dy * dy) < 8) {
              onSelectNode(d.id);
            }
          }, { passive: true });
      });
    }

    node.call(
      d3.drag()
        .on('start', (event, d) => {
          if (event.sourceEvent) {
            event.sourceEvent.stopPropagation();
            if (event.sourceEvent.currentTarget) {
              event.sourceEvent.currentTarget.style.touchAction = 'none';
            }
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
        }),
    );

    const knowledgeNodes = node.filter((d) => isKnowledgeNode(d.type));
    const beingNodes = node.filter((d) => !isKnowledgeNode(d.type));

    beingNodes.append('circle')
      .attr('class', (d) => `node-ring ${d.premium ? 'node-premium-ring' : ''}`)
      .attr('r', (d) => d.size + 6)
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-width', (d) => d.premium ? 3 : 2)
      .style('filter', 'blur(3px)');

    knowledgeNodes.append('polygon')
      .attr('class', (d) => `node-ring ${d.premium ? 'node-premium-ring' : ''}`)
      .attr('points', (d) => octagonPoints(d.size + 8))
      .attr('fill', 'none')
      .attr('stroke', (d) => getNodeColor(d.type))
      .attr('stroke-width', (d) => d.premium ? 3 : 2)
      .style('filter', 'blur(2px)');

    beingNodes.append('circle')
      .attr('r', (d) => d.size)
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('opacity', 0.15);

    knowledgeNodes.append('polygon')
      .attr('points', (d) => octagonPoints(d.size))
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('opacity', 0.15);

    beingNodes.append('circle')
      .attr('r', (d) => d.size * 0.6)
      .attr('fill', (d) => getNodeColor(d.type))
      .style('filter', isTouchDevice ? null : 'drop-shadow(0 0 8px currentColor)');

    knowledgeNodes.append('polygon')
      .attr('points', (d) => octagonPoints(d.size * 0.6))
      .attr('fill', (d) => getNodeColor(d.type))
      .style('filter', isTouchDevice ? null : (d) => `drop-shadow(0 0 12px ${getNodeColor(d.type)})`);

    if (isTouchDevice) {
      node.append('circle')
        .attr('r', (d) => Math.max(d.size + 10, 22))
        .attr('fill', 'transparent')
        .attr('stroke', 'none');
    }

    node.append('text')
      .attr('class', 'node-label')
      .attr('dy', (d) => d.size + 16)
      .attr('font-size', (d) => Math.max(isMobile ? 8 : 9, d.size * 0.5))
      .text((d) => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    svg.on('click', (e) => {
      if (e.target === svgRef.current) onSelectNode(null);
    });

    return () => simulation.stop();
  }, [data, onHoverNode, onSelectNode]);

  useEffect(() => {
    if (!gRef.current) return;

    d3.select(gRef.current).selectAll('.node-group')
      .selectAll('.node-ring')
      .style('opacity', (d) => (d.id === selectedNodeId ? 1 : 0));

    d3.select(gRef.current).selectAll('.node-group')
      .selectAll('.node-label')
      .style('fill', (d) => (d.id === selectedNodeId ? '#f0b84a' : '#e8d5a3'))
      .style('font-weight', (d) => (d.id === selectedNodeId ? 'bold' : 'normal'));

    d3.select(gRef.current).selectAll('.link')
      .style('stroke', (d) => (d.source.id === selectedNodeId || d.target.id === selectedNodeId ? 'rgba(212,151,58,.5)' : null))
      .style('stroke-opacity', (d) => (d.source.id === selectedNodeId || d.target.id === selectedNodeId ? 1 : null))
      .style('stroke-width', (d) => (d.source.id === selectedNodeId || d.target.id === selectedNodeId ? 2.5 : null));
  }, [selectedNodeId]);

  useEffect(() => {
    if (!gRef.current) return;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchedNodeIds = new Set();

    if (q) {
      data.nodes.forEach((d) => {
        const match =
          d.label.toLowerCase().includes(q) ||
          (d.epithets || []).some((e) => e.toLowerCase().includes(q)) ||
          (d.desc || '').toLowerCase().includes(q) ||
          (d.sanskrit || '').toLowerCase().includes(q);

        if (match) {
          matchedNodeIds.add(d.id);
          data.links.forEach((l) => {
            if (l.source.id === d.id) matchedNodeIds.add(l.target.id);
            if (l.target.id === d.id) matchedNodeIds.add(l.source.id);
          });
        }
      });
    }

    d3.select(gRef.current).selectAll('.node-group')
      .style('opacity', (d) => {
        if (activeArcNodes) return activeArcNodes.includes(d.id) ? 1 : 0.05;
        if (!q) {
          if (linkFilter !== 'all') {
            const hasLink = data.links.some((l) => l.type === linkFilter && (l.source.id === d.id || l.target.id === d.id));
            return hasLink ? 1 : 0.08;
          }
          return 1;
        }
        return matchedNodeIds.has(d.id) ? 1 : 0.08;
      });

    d3.select(gRef.current).selectAll('.link')
      .style('opacity', (l) => {
        if (activeArcNodes) return activeArcNodes.includes(l.source.id) && activeArcNodes.includes(l.target.id) ? 0.8 : 0.02;
        if (linkFilter === 'all') {
          return q ? (matchedNodeIds.has(l.source.id) && matchedNodeIds.has(l.target.id) ? 0.6 : 0.03) : null;
        }
        return l.type === linkFilter ? 1 : 0.03;
      })
      .style('stroke-width', (l) => {
        if (activeArcNodes) return activeArcNodes.includes(l.source.id) && activeArcNodes.includes(l.target.id) ? 2 : 1;
        return linkFilter === 'all' ? 1.5 : (l.type === linkFilter ? 2.5 : 1);
      });
  }, [activeArcNodes, data.links, data.nodes, linkFilter, searchQuery]);

  return (
    <div className="graph-container">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}

export default Graph;
