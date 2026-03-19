import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios.js';
import Graph from '../components/Graph.jsx';
import Loader from '../components/Loader.jsx';
import DetailPanel from '../components/DetailPanel.jsx';
import Header from '../components/Header.jsx';
import Legend from '../components/Legend.jsx';
import YugaTimeline from '../components/YugaTimeline.jsx';
import NodeCounter from '../components/NodeCounter.jsx';

function GraphPage() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [yugaFilter, setYugaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/graph');
        setData(res.data);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    let nodes = data.nodes;
    let links = data.links;

    if (yugaFilter !== 'all') {
      nodes = nodes.filter(n => n.yuga === yugaFilter || n.yuga === 'eternal');
    }

    if (typeFilter !== 'all') {
      nodes = nodes.filter(n => n.type === typeFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      nodes = nodes.filter(n => 
        n.label.toLowerCase().includes(q) || 
        n.epithets?.some(e => e.toLowerCase().includes(q)) ||
        n.sanskrit?.includes(q)
      );
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    links = links.filter(l => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target));

    return { nodes, links };
  }, [data, yugaFilter, typeFilter, searchQuery]);

  const selectedNode = useMemo(() => 
    data.nodes.find(n => n.id === selectedNodeId),
  [data.nodes, selectedNodeId]);

  const relatedLinks = useMemo(() => 
    selectedNodeId ? data.links.filter(l => (l.source?.id || l.source) === selectedNodeId || (l.target?.id || l.target) === selectedNodeId) : [],
  [data.links, selectedNodeId]);

  const handleSelectNode = React.useCallback((id) => {
    setSelectedNodeId(id);
  }, []);

  return (
    <div className="graph-viewer">
      <Loader visible={loading} />
      
      <Header 
        typeFilter={typeFilter} 
        setTypeFilter={setTypeFilter} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      <Graph 
        data={filteredData} 
        onSelectNode={handleSelectNode}
        selectedNodeId={selectedNodeId}
      />

      <Legend />
      <NodeCounter count={filteredData.nodes.length} />

      <YugaTimeline 
        activeYuga={yugaFilter} 
        setYuga={setYugaFilter} 
      />

      <DetailPanel 
        node={selectedNode} 
        links={relatedLinks}
        allNodes={data.nodes}
        onClose={() => setSelectedNodeId(null)}
        onSelectNode={id => setSelectedNodeId(id)}
      />
      
      <div className="instructions">
        Scroll to zoom · Mouse to drag · Click to explore
      </div>
    </div>
  );
}

export default GraphPage;
