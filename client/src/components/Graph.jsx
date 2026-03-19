import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

const COLORS = {
  deva: '#d4973a',       // Amber
  devi: '#c45c8a',       // Lotus
  hero: '#5c8ac4',       // Dharma
  asura: '#c45c5c',      // Destroy
  sage: '#5cb88a',       // Sacred
  celestial: '#9a6ed4',  // Celestial
};

function Graph({ data, onSelectNode, selectedNodeId }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);
  const gRef = useRef(null);

  useEffect(() => {
    if (!data.nodes.length) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Main container group for zoom/pan
    const g = svg.append('g');
    gRef.current = g.node();

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([.1, 8])
      .on('zoom', (event) => g.attr('transform', event.transform));

    svg.call(zoom);

    // Initial transform to center the graph
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(.4));

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(120).strength(1))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(0, 0))
      .force('collision', d3.forceCollide().radius(d => d.size + 15));

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

    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', 'rgba(232,213,163,.15)')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)');

    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', 'node-group')
      .on('click', (e, d) => {
        if (e.defaultPrevented) return; // Prevent selection if dragging
        console.log("Archive selection signal sent:", d.id);
        e.stopPropagation();
        onSelectNode(d.id);
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Outer glow ring
    node.append('circle')
      .attr('class', 'node-ring')
      .attr('r', d => d.size + 6)
      .attr('fill', 'none')
      .attr('stroke', d => COLORS[d.type] || '#fff')
      .attr('stroke-width', 2)
      .style('filter', 'blur(3px)');

    // Inner glow
    node.append('circle')
      .attr('r', d => d.size)
      .attr('fill', d => COLORS[d.type] || '#fff')
      .attr('opacity', .15);

    // Main circle
    node.append('circle')
      .attr('r', d => d.size * .6)
      .attr('fill', d => COLORS[d.type] || '#fff')
      .style('filter', 'drop-shadow(0 0 8px currentColor)');

    // Character Label
    node.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.size + 16)
      .attr('font-size', d => Math.max(9, d.size * .5))
      .text(d => d.label);

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    // Background click to deselect
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
      .style('stroke', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 'rgba(212,151,58,.5)' : 'rgba(232,213,163,.15)')
      .style('stroke-opacity', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 1 : .32)
      .style('stroke-width', d => (d.source.id === selectedNodeId || d.target.id === selectedNodeId) ? 2.5 : 1.5);
  }, [selectedNodeId]);

  return (
    <div className="graph-container">
      <svg ref={svgRef} className="graph-svg" />
    </div>
  );
}

export default Graph;
