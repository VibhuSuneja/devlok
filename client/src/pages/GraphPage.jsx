import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import posthog from 'posthog-js';
import axios from '../api/axios.js';
import ArcSelector from '../components/ArcSelector.jsx';
import DetailPanel from '../components/DetailPanel.jsx';
import Graph from '../components/Graph.jsx';
import GurukulLauncher from '../components/GurukulLauncher.jsx';
import Header from '../components/Header.jsx';
import IntroOverlay from '../components/IntroOverlay.jsx';
import Legend from '../components/Legend.jsx';
import Loader from '../components/Loader.jsx';
import NodeCounter from '../components/NodeCounter.jsx';
import Tooltip from '../components/Tooltip.jsx';
import YugaTimeline from '../components/YugaTimeline.jsx';
import guidedPaths from '../data/guidedPaths.json';
import storyArcs from '../data/storyArcs.json';

function PathMode({ paths, activePathId, onOpenPath, onClosePath, activePath, activeStepIndex, onStepChange, onSelectNode }) {
  const currentStep = activePath?.steps?.[activeStepIndex] || null;

  return (
    <div className="path-mode-panel">
      <div className="path-mode-header">
        <div>
          <div className="path-mode-eyebrow">Guided Learning Paths</div>
          <h3 className="path-mode-title">{activePath ? activePath.title : 'Choose a path'}</h3>
        </div>
        {activePathId && (
          <button className="path-mode-close" onClick={onClosePath}>
            Exit Path
          </button>
        )}
      </div>

      {!activePath ? (
        <div className="path-mode-list">
          {paths.map((path) => (
            <button
              key={path.id}
              className={`path-mode-card ${path.id === activePathId ? 'active' : ''}`}
              onClick={() => onOpenPath(path.id)}
            >
              <div className="path-mode-card-title">{path.title}</div>
              <div className="path-mode-card-thesis">{path.thesis}</div>
              <div className="path-mode-card-meta">
                {path.steps.length} steps · {path.startNodeId} to {path.endNodeId}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="path-mode-active">
          <p className="path-mode-thesis">{activePath.thesis}</p>
          <div className="path-mode-steps">
            {activePath.steps.map((step, index) => (
              <button
                key={`${activePath.id}-${step.nodeId}`}
                className={`path-mode-step ${index === activeStepIndex ? 'active' : ''}`}
                onClick={() => {
                  onStepChange(index);
                  onSelectNode(step.nodeId);
                }}
              >
                <span className="path-mode-step-index">{index + 1}</span>
                <span className="path-mode-step-label">{step.title}</span>
              </button>
            ))}
          </div>

          {currentStep && (
            <div className="path-mode-body">
              <div className="path-mode-body-header">
                <span className="path-mode-node-chip" onClick={() => onSelectNode(currentStep.nodeId)} role="button" tabIndex={0}>
                  {currentStep.nodeId}
                </span>
                <span className="path-mode-progress">
                  Step {activeStepIndex + 1} of {activePath.steps.length}
                </span>
              </div>
              <h4>{currentStep.title}</h4>
              <p>{currentStep.body}</p>
              <div className="path-mode-actions">
                <button
                  className="path-mode-nav"
                  onClick={() => {
                    const nextIndex = Math.max(0, activeStepIndex - 1);
                    onStepChange(nextIndex);
                    onSelectNode(activePath.steps[nextIndex].nodeId);
                  }}
                  disabled={activeStepIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="path-mode-nav"
                  onClick={() => {
                    const nextIndex = Math.min(activePath.steps.length - 1, activeStepIndex + 1);
                    onStepChange(nextIndex);
                    onSelectNode(activePath.steps[nextIndex].nodeId);
                  }}
                  disabled={activeStepIndex === activePath.steps.length - 1}
                >
                  Next
                </button>
              </div>
              {!!activePath.citations?.length && (
                <div className="path-mode-citations">
                  {activePath.citations.map((citation) => (
                    <span key={citation}>{citation}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GraphPage() {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [yugaFilter, setYugaFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [linkFilter, setLinkFilter] = useState('all');
  const [activeArcId, setActiveArcId] = useState(null);
  const [activePathId, setActivePathId] = useState(null);
  const [activePathStepIndex, setActivePathStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, node: null });
  const [showIntro, setShowIntro] = useState(() => !localStorage.getItem('hasSeenIntro'));
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const unselectTimerRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();

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

    return () => {
      if (unselectTimerRef.current) clearTimeout(unselectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const focusId = searchParams.get('focus');
    const pathId = searchParams.get('path');
    const pathStep = Number.parseInt(searchParams.get('step') || '0', 10);

    if (focusId) {
      setSelectedNodeId(focusId);
      setIsPanelOpen(true);
    }

    if (pathId) {
      const path = guidedPaths.find((entry) => entry.id === pathId);
      if (path) {
        const nextStepIndex = Number.isNaN(pathStep) ? 0 : Math.min(Math.max(pathStep, 0), path.steps.length - 1);
        setActivePathId(pathId);
        setActivePathStepIndex(nextStepIndex);
        setSelectedNodeId(path.steps[nextStepIndex].nodeId);
        setIsPanelOpen(true);
      }
    } else if (activePathId && activePathId !== '__picker__') {
      setActivePathId(null);
    }
  }, [activePathId, searchParams]);

  const filteredData = useMemo(() => {
    let nodes = data.nodes;
    let links = data.links;

    if (yugaFilter !== 'all') {
      nodes = nodes.filter((n) => n.yuga === yugaFilter || n.yuga === 'eternal');
    }

    if (typeFilter !== 'all') {
      nodes = nodes.filter((n) => n.type === typeFilter);
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    links = links.filter((l) => nodeIds.has(l.source?.id || l.source) && nodeIds.has(l.target?.id || l.target));

    return { nodes, links };
  }, [data, typeFilter, yugaFilter]);

  const selectedNode = useMemo(
    () => data.nodes.find((n) => n.id === selectedNodeId),
    [data.nodes, selectedNodeId],
  );

  const relatedLinks = useMemo(
    () => selectedNodeId
      ? data.links.filter((l) => (l.source?.id || l.source) === selectedNodeId || (l.target?.id || l.target) === selectedNodeId)
      : [],
    [data.links, selectedNodeId],
  );

  const activeArcNodes = useMemo(() => {
    if (!activeArcId) return null;
    return storyArcs.find((entry) => entry.id === activeArcId)?.nodes || null;
  }, [activeArcId]);

  const activePath = useMemo(
    () => guidedPaths.find((entry) => entry.id === activePathId) || null,
    [activePathId],
  );

  const updateQueryParams = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleSelectNode = useCallback((id) => {
    if (unselectTimerRef.current) {
      clearTimeout(unselectTimerRef.current);
      unselectTimerRef.current = null;
    }

    if (id) {
      posthog.capture('node_clicked', { node_id: id, path_id: activePathId || null });
    }

    setSelectedNodeId(id);
    setIsPanelOpen(!!id);
    updateQueryParams({ focus: id || null });
  }, [activePathId, updateQueryParams]);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    if (unselectTimerRef.current) clearTimeout(unselectTimerRef.current);
    unselectTimerRef.current = setTimeout(() => {
      setSelectedNodeId(null);
      updateQueryParams({ focus: null });
      unselectTimerRef.current = null;
    }, 3000);
  }, [updateQueryParams]);

  const openPath = useCallback((pathId) => {
    const path = guidedPaths.find((entry) => entry.id === pathId);
    if (!path) return;
    setActiveArcId(null);
    setActivePathId(pathId);
    setActivePathStepIndex(0);
    setSelectedNodeId(path.steps[0].nodeId);
    setIsPanelOpen(true);
    updateQueryParams({ path: pathId, step: 0, focus: path.steps[0].nodeId });
    posthog.capture('guided_path_started', { path_id: pathId });
  }, [updateQueryParams]);

  const closePath = useCallback(() => {
    setActivePathId(null);
    setActivePathStepIndex(0);
    updateQueryParams({ path: null, step: null });
  }, [updateQueryParams]);

  const setPathStep = useCallback((stepIndex) => {
    setActivePathStepIndex(stepIndex);
    updateQueryParams({ step: stepIndex });
  }, [updateQueryParams]);

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
        linkFilter={linkFilter}
        setLinkFilter={setLinkFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenPaths={() => setActivePathId((current) => current || '__picker__')}
      />

      <Graph
        data={filteredData}
        onSelectNode={handleSelectNode}
        onHoverNode={setTooltip}
        selectedNodeId={selectedNodeId}
        searchQuery={searchQuery}
        linkFilter={linkFilter}
        activeArcNodes={activePath ? activePath.steps.map((step) => step.nodeId) : activeArcNodes}
      />

      <Legend />
      <ArcSelector activeArcId={activeArcId} setActiveArcId={setActiveArcId} />
      <NodeCounter count={filteredData.nodes.length} />
      <YugaTimeline activeYuga={yugaFilter} setYuga={setYugaFilter} />
      <GurukulLauncher />

      {(activePathId || searchParams.get('paths') === 'open') && (
        <PathMode
          paths={guidedPaths}
          activePathId={activePathId}
          activePath={activePathId === '__picker__' ? null : activePath}
          activeStepIndex={activePathStepIndex}
          onOpenPath={openPath}
          onClosePath={() => {
            closePath();
            setActivePathId(null);
          }}
          onStepChange={setPathStep}
          onSelectNode={handleSelectNode}
        />
      )}

      <DetailPanel
        node={isPanelOpen ? selectedNode : null}
        links={relatedLinks}
        allNodes={data.nodes}
        onClose={handleClosePanel}
        onSelectNode={handleSelectNode}
      />

      <Tooltip node={tooltip.node} x={tooltip.x} y={tooltip.y} visible={tooltip.visible} />

      <div className="instructions">
        Scroll to zoom · Mouse to drag · Click to explore
      </div>
    </div>
  );
}

export default GraphPage;
