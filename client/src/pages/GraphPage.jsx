import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from '../api/axios.js';
import Graph from '../components/Graph.jsx';
import Loader from '../components/Loader.jsx';
import DetailPanel from '../components/DetailPanel.jsx';
import Header from '../components/Header.jsx';
import Legend from '../components/Legend.jsx';
import YugaTimeline from '../components/YugaTimeline.jsx';
import NodeCounter from '../components/NodeCounter.jsx';
import Tooltip from '../components/Tooltip.jsx';
import IntroOverlay from '../components/IntroOverlay.jsx';

function GraphPage() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [yugaFilter, setYugaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [showIntro, setShowIntro] = useState(() => {
    // Check if user has already entered the site before
    return !localStorage.getItem('hasSeenIntro');
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const unselectTimerRef = useRef(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/graph');
        setData(res.data);
        
        const focusId = searchParams.get('focus');
        if (focusId) {
          setSelectedNodeId(focusId);
          setIsPanelOpen(true);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => {
      if (unselectTimerRef.current) {
        clearTimeout(unselectTimerRef.current);
      }
    };
  }, [searchParams]);

  const filteredData = useMemo(() => {
    let nodes = data.nodes;
    let links = data.links;

    if (yugaFilter !== 'all') {
      nodes = nodes.filter(n => n.yuga === yugaFilter || n.yuga === 'eternal');
    }

    if (typeFilter !== 'all') {
      nodes = nodes.filter(n => n.type === typeFilter);
    }

    const nodeIds = new Set(nodes.map(n => n.id));
    links = links.filter(l => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target));

    return { nodes, links };
  }, [data, yugaFilter, typeFilter]);

  const selectedNode = useMemo(() => 
    data.nodes.find(n => n.id === selectedNodeId),
  [data.nodes, selectedNodeId]);

  const relatedLinks = useMemo(() => 
    selectedNodeId ? data.links.filter(l => (l.source?.id || l.source) === selectedNodeId || (l.target?.id || l.target) === selectedNodeId) : [],
  [data.links, selectedNodeId]);

  const handleSelectNode = useCallback((id) => {
    if (unselectTimerRef.current) {
      clearTimeout(unselectTimerRef.current);
      unselectTimerRef.current = null;
    }
    setSelectedNodeId(id);
    setIsPanelOpen(!!id);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    
    if (unselectTimerRef.current) {
      clearTimeout(unselectTimerRef.current);
    }
    
    unselectTimerRef.current = setTimeout(() => {
      setSelectedNodeId(null);
      unselectTimerRef.current = null;
    }, 3000); // Wait for 3 seconds
  }, []);

  return (
    <div className="graph-viewer">
      {showIntro && (
        <IntroOverlay 
          onEnter={() => {
            setShowIntro(false);
            localStorage.setItem('hasSeenIntro', 'true');
          }} 
        />
      )}
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
        onHoverNode={setTooltip}
        selectedNodeId={selectedNodeId}
        searchQuery={searchQuery}
      />

      <Legend />
      <NodeCounter count={filteredData.nodes.length} />

      <YugaTimeline 
        activeYuga={yugaFilter} 
        setYuga={setYugaFilter} 
      />

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
      
      <div className="instructions">
        Scroll to zoom · Mouse to drag · Click to explore
      </div>
    </div>
  );
}

export default GraphPage;
