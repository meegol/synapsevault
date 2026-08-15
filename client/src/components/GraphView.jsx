import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Play, 
  Pause, 
  Filter, 
  BookOpen, 
  ExternalLink, 
  Hash, 
  X, 
  Share2, 
  Layers,
  FileText
} from 'lucide-react';
import YouTubeIcon from './YouTubeIcon';

export default function GraphView({ 
  graphData, 
  searchQuery = '', 
  onSelectDoc, 
  documents = [] 
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Graph state
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Category filters
  const [filters, setFilters] = useState({
    documents: true,
    concepts: true,
    tags: true,
  });

  // Transform / Camera
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef(null);

  // Simulated Nodes & Links cache
  const simulationRef = useRef({
    nodes: [],
    links: [],
    alpha: 1,
  });

  // Initialize simulation data when graphData changes
  useEffect(() => {
    if (!graphData || !graphData.nodes) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // Filter nodes according to filters
    const visibleNodes = graphData.nodes.filter(n => {
      if (n.category === 'document' && !filters.documents) return false;
      if (n.category === 'concept' && !filters.concepts) return false;
      if (n.category === 'tag' && !filters.tags) return false;
      return true;
    });

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));

    // Filter links
    const visibleLinks = graphData.links.filter(l => 
      visibleNodeIds.has(typeof l.source === 'object' ? l.source.id : l.source) &&
      visibleNodeIds.has(typeof l.target === 'object' ? l.target.id : l.target)
    );

    // Map to preserve previous positions
    const prevMap = new Map(simulationRef.current.nodes.map(n => [n.id, { x: n.x, y: n.y, vx: n.vx, vy: n.vy }]));

    const simNodes = visibleNodes.map(n => {
      const prev = prevMap.get(n.id);
      return {
        ...n,
        x: prev?.x ?? (width / 2 + (Math.random() - 0.5) * 400),
        y: prev?.y ?? (height / 2 + (Math.random() - 0.5) * 400),
        vx: prev?.vx ?? 0,
        vy: prev?.vy ?? 0,
        radius: n.category === 'document' ? 9 : n.category === 'concept' ? 6 : 5
      };
    });

    const nodeIndex = new Map(simNodes.map(n => [n.id, n]));

    const simLinks = visibleLinks.map(l => ({
      ...l,
      source: nodeIndex.get(typeof l.source === 'object' ? l.source.id : l.source),
      target: nodeIndex.get(typeof l.target === 'object' ? l.target.id : l.target),
    })).filter(l => l.source && l.target);

    simulationRef.current = {
      nodes: simNodes,
      links: simLinks,
      alpha: 1
    };

    // Center camera on first load
    if (transformRef.current.k === 1 && transformRef.current.x === 0) {
      transformRef.current = { x: width / 2, y: height / 2, k: 0.9 };
    }
  }, [graphData, filters]);

  // Compute matched nodes and 1-hop / 2-hop neighbor sets for highlighting
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const query = searchQuery.toLowerCase().trim();
    const matched = new Set();
    const oneHop = new Set();

    simulationRef.current.nodes.forEach(n => {
      if (
        n.label.toLowerCase().includes(query) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(query))) ||
        (n.description && n.description.toLowerCase().includes(query))
      ) {
        matched.add(n.id);
      }
    });

    // Find 1-hop connections
    simulationRef.current.links.forEach(l => {
      const sId = l.source.id;
      const tId = l.target.id;
      if (matched.has(sId)) oneHop.add(tId);
      if (matched.has(tId)) oneHop.add(sId);
    });

    return { matched, oneHop };
  }, [searchQuery, graphData]);

  // Compute Hovered 1-hop connections
  const hoveredNeighbors = useMemo(() => {
    if (!hoveredNode) return null;
    const set = new Set([hoveredNode.id]);
    simulationRef.current.links.forEach(l => {
      if (l.source.id === hoveredNode.id) set.add(l.target.id);
      if (l.target.id === hoveredNode.id) set.add(l.source.id);
    });
    return set;
  }, [hoveredNode]);

  // Physics loop and Canvas Render
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${container.clientHeight}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const render = () => {
      const container = containerRef.current;
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;

      const { nodes, links } = simulationRef.current;

      // 1. Force Simulation Step
      if (isPlaying && simulationRef.current.alpha > 0.002) {
        simulationRef.current.alpha *= 0.99; // Damping

        // Center gravity force
        nodes.forEach(n => {
          if (n === draggedNodeRef.current) return;
          const dx = width / 2 - n.x;
          const dy = height / 2 - n.y;
          n.vx += dx * 0.0003;
          n.vy += dy * 0.0003;
        });

        // Repulsion (Coulomb's Law approximation)
        for (let i = 0; i < nodes.length; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < nodes.length; j++) {
            const b = nodes[j];
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy + 100;
            const dist = Math.sqrt(distSq);
            const force = (a.category === 'document' || b.category === 'document' ? -120 : -50) / distSq;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            if (a !== draggedNodeRef.current) {
              a.vx += fx;
              a.vy += fy;
            }
            if (b !== draggedNodeRef.current) {
              b.vx -= fx;
              b.vy -= fy;
            }
          }
        }

        // Link spring force (Hooke's Law)
        links.forEach(l => {
          const dx = l.target.x - l.source.x;
          const dy = l.target.y - l.source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const targetDist = l.type === 'concept_relation' ? 60 : 90;
          const force = (dist - targetDist) * 0.03 * (l.weight || 1);

          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          if (l.source !== draggedNodeRef.current) {
            l.source.vx += fx;
            l.source.vy += fy;
          }
          if (l.target !== draggedNodeRef.current) {
            l.target.vx -= fx;
            l.target.vy -= fy;
          }
        });

        // Integrate positions & apply velocity drag
        nodes.forEach(n => {
          if (n === draggedNodeRef.current) return;
          n.vx *= 0.85;
          n.vy *= 0.85;
          n.x += n.vx;
          n.y += n.vy;
        });
      }

      // 2. Clear Canvas
      ctx.save();
      ctx.clearRect(0, 0, width, height);

      // Apply Pan & Zoom
      const { x, y, k } = transformRef.current;
      ctx.translate(x, y);
      ctx.scale(k, k);

      // Draw subtle background grid dots
      const gridSize = 40;
      const startX = -x / k - 200;
      const startY = -y / k - 200;
      const endX = (width - x) / k + 200;
      const endY = (height - y) / k + 200;

      ctx.fillStyle = 'rgba(235, 219, 178, 0.03)';
      for (let gx = Math.floor(startX / gridSize) * gridSize; gx < endX; gx += gridSize) {
        for (let gy = Math.floor(startY / gridSize) * gridSize; gy < endY; gy += gridSize) {
          ctx.fillRect(gx, gy, 1.5, 1.5);
        }
      }

      // 3. Draw Links
      links.forEach(l => {
        let isHighlighted = false;
        let opacity = 0.2;

        if (searchMatches) {
          const sMatch = searchMatches.matched.has(l.source.id);
          const tMatch = searchMatches.matched.has(l.target.id);
          if (sMatch || tMatch) {
            isHighlighted = true;
            opacity = 0.7;
          } else {
            opacity = 0.04;
          }
        } else if (hoveredNeighbors) {
          if (hoveredNeighbors.has(l.source.id) && hoveredNeighbors.has(l.target.id)) {
            isHighlighted = true;
            opacity = 0.8;
          } else {
            opacity = 0.05;
          }
        }

        ctx.beginPath();
        ctx.moveTo(l.source.x, l.source.y);
        ctx.lineTo(l.target.x, l.target.y);
        ctx.strokeStyle = isHighlighted ? '#fabd2f' : 'rgba(168, 153, 132, ' + opacity + ')';
        ctx.lineWidth = isHighlighted ? 1.8 / k : 0.9 / k;
        ctx.stroke();
      });

      // 4. Draw Nodes
      nodes.forEach(n => {
        const isMatched = searchMatches ? searchMatches.matched.has(n.id) : false;
        const isOneHop = searchMatches ? searchMatches.oneHop.has(n.id) : false;
        const isHovered = hoveredNode?.id === n.id;
        const isHoverNeighbor = hoveredNeighbors ? hoveredNeighbors.has(n.id) : false;
        const isSelected = selectedNode?.id === n.id;

        let alpha = 1;
        if (searchMatches && !isMatched && !isOneHop) {
          alpha = 0.12;
        } else if (hoveredNeighbors && !isHoverNeighbor) {
          alpha = 0.15;
        }

        ctx.globalAlpha = alpha;

        // Draw Outer Glow for Matched / Hovered Nodes
        if (isMatched || isHovered || isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 8 / k, 0, Math.PI * 2);
          ctx.fillStyle = n.color || '#fabd2f';
          ctx.globalAlpha = alpha * 0.3;
          ctx.fill();
          ctx.globalAlpha = alpha;
        }

        // Draw Node Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius / Math.max(0.6, Math.min(1.2, k)), 0, Math.PI * 2);
        ctx.fillStyle = n.color || '#fabd2f';
        ctx.fill();
        ctx.lineWidth = 1.5 / k;
        ctx.strokeStyle = isSelected ? '#fbf1c7' : '#1d2021';
        ctx.stroke();

        // Draw Labels
        const shouldShowLabel = k > 0.6 || isMatched || isHovered || isSelected || n.category === 'document';
        if (shouldShowLabel) {
          const fontSize = n.category === 'document' ? 11 : 9.5;
          ctx.font = `${n.category === 'document' ? '600' : '500'} ${fontSize / k}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Text shadow outline for legibility
          ctx.lineWidth = 3 / k;
          ctx.strokeStyle = '#1d2021';
          ctx.strokeText(n.label, n.x, n.y + (n.radius + 10) / k);

          ctx.fillStyle = isMatched ? '#fabd2f' : isSelected ? '#fbf1c7' : '#ebdbb2';
          ctx.fillText(n.label, n.x, n.y + (n.radius + 10) / k);
        }

        ctx.globalAlpha = 1;
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, searchMatches, hoveredNeighbors, hoveredNode, selectedNode]);

  // Coordinate transforms
  const screenToWorld = (screenX, screenY) => {
    const { x, y, k } = transformRef.current;
    return {
      x: (screenX - x) / k,
      y: (screenY - y) / k
    };
  };

  // Find node under mouse
  const getNodeAt = (screenX, screenY) => {
    const { x, y } = screenToWorld(screenX, screenY);
    const nodes = simulationRef.current.nodes;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = n.x - x;
      const dy = n.y - y;
      if (dx * dx + dy * dy <= (n.radius + 4) * (n.radius + 4)) {
        return n;
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const node = getNodeAt(mouseX, mouseY);
    if (node) {
      draggedNodeRef.current = node;
      simulationRef.current.alpha = 0.5; // Re-awaken simulation on drag
    } else {
      isDraggingRef.current = true;
      dragStartRef.current = { x: mouseX - transformRef.current.x, y: mouseY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggedNodeRef.current) {
      const world = screenToWorld(mouseX, mouseY);
      draggedNodeRef.current.x = world.x;
      draggedNodeRef.current.y = world.y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
      simulationRef.current.alpha = 0.3;
    } else if (isDraggingRef.current) {
      transformRef.current.x = mouseX - dragStartRef.current.x;
      transformRef.current.y = mouseY - dragStartRef.current.y;
    } else {
      const node = getNodeAt(mouseX, mouseY);
      setHoveredNode(node);
    }
  };

  const handleMouseUp = (e) => {
    if (draggedNodeRef.current) {
      draggedNodeRef.current = null;
    }
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  const handleClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const node = getNodeAt(mouseX, mouseY);
    setSelectedNode(node);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newK = Math.max(0.2, Math.min(4, transformRef.current.k * zoomFactor));

    const world = screenToWorld(mouseX, mouseY);
    transformRef.current.x = mouseX - world.x * newK;
    transformRef.current.y = mouseY - world.y * newK;
    transformRef.current.k = newK;
  };

  const handleResetCamera = () => {
    const container = containerRef.current;
    if (!container) return;
    transformRef.current = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
      k: 0.9
    };
    simulationRef.current.alpha = 0.5;
  };

  // Connected documents for selected concept/tag
  const connectedDocuments = useMemo(() => {
    if (!selectedNode) return [];
    if (selectedNode.category === 'document') {
      return documents.filter(d => d.id === selectedNode.docId);
    }
    // For concept or tag, find all linked documents
    const docIds = new Set();
    simulationRef.current.links.forEach(l => {
      if (l.source.id === selectedNode.id && l.target.category === 'document') {
        docIds.add(l.target.docId);
      }
      if (l.target.id === selectedNode.id && l.source.category === 'document') {
        docIds.add(l.source.docId);
      }
    });
    return documents.filter(d => docIds.has(d.id));
  }, [selectedNode, documents]);

  return (
    <div ref={containerRef} className="relative w-full h-[calc(100vh-4rem)] bg-gruvbox-bgHard overflow-hidden select-none">
      
      {/* 2D Canvas Force Graph */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Floating Graph Controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
        <div className="glass-panel p-1 rounded-lg flex items-center gap-1 shadow-glass">
          <button
            onClick={() => {
              transformRef.current.k = Math.min(4, transformRef.current.k * 1.25);
            }}
            className="p-1.5 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              transformRef.current.k = Math.max(0.2, transformRef.current.k * 0.8);
            }}
            className="p-1.5 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg transition-colors"
            title="Reset View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-gruvbox-bg1 mx-0.5" />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded transition-colors ${
              isPlaying ? 'text-gruvbox-green hover:bg-gruvbox-green/20' : 'text-gruvbox-gray hover:bg-gruvbox-bg1'
            }`}
            title={isPlaying ? 'Pause Physics' : 'Resume Physics'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded transition-colors ${
              showFilters ? 'bg-gruvbox-yellow/20 text-gruvbox-yellow' : 'text-gruvbox-gray hover:bg-gruvbox-bg1'
            }`}
            title="Filter Node Types"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Dropdown */}
        {showFilters && (
          <div className="glass-panel p-3 rounded-lg shadow-glass space-y-2 w-48 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="text-[10px] text-gruvbox-gray font-bold uppercase tracking-wider block">Visible Layers</span>
            <label className="flex items-center gap-2 cursor-pointer text-gruvbox-fg hover:text-gruvbox-yellow">
              <input
                type="checkbox"
                checked={filters.documents}
                onChange={(e) => setFilters(f => ({ ...f, documents: e.target.checked }))}
                className="accent-gruvbox-red rounded"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gruvbox-red"></span> Documents
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gruvbox-fg hover:text-gruvbox-yellow">
              <input
                type="checkbox"
                checked={filters.concepts}
                onChange={(e) => setFilters(f => ({ ...f, concepts: e.target.checked }))}
                className="accent-gruvbox-yellow rounded"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gruvbox-yellow"></span> Concepts
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-gruvbox-fg hover:text-gruvbox-yellow">
              <input
                type="checkbox"
                checked={filters.tags}
                onChange={(e) => setFilters(f => ({ ...f, tags: e.target.checked }))}
                className="accent-gruvbox-aqua rounded"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gruvbox-aqua"></span> Tags
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Legend Badge */}
      <div className="absolute bottom-4 left-4 glass-panel px-3 py-2 rounded-lg flex items-center gap-4 text-[11px] font-mono text-gruvbox-gray z-10">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gruvbox-red"></span>
          <span>PDFs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gruvbox-orange"></span>
          <span>YouTube</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gruvbox-blue"></span>
          <span>Notes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gruvbox-yellow"></span>
          <span>Concepts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gruvbox-aqua"></span>
          <span>Tags</span>
        </div>
      </div>

      {/* Search Query Active Notification */}
      {searchQuery && (
        <div className="absolute top-4 right-4 glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono text-gruvbox-yellow border border-gruvbox-yellow/30 z-10">
          <Sparkles className="w-3.5 h-3.5 animate-spin text-gruvbox-yellow" />
          <span>Showing connections for "{searchQuery}"</span>
        </div>
      )}

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bottom-4 w-96 glass-panel-elevated rounded-xl p-5 flex flex-col z-20 shadow-2xl animate-in slide-in-from-right duration-300">
          <div className="flex items-start justify-between pb-3 border-b border-gruvbox-bg1">
            <div className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: selectedNode.color || '#fabd2f' }}
              />
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gruvbox-bg1 text-gruvbox-gray font-bold">
                {selectedNode.category}
              </span>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 rounded hover:bg-gruvbox-bg1 text-gruvbox-gray hover:text-gruvbox-fg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            <div>
              <h3 className="text-base font-mono font-bold text-gruvbox-fgLight">
                {selectedNode.label}
              </h3>
              {selectedNode.description && (
                <p className="text-xs text-gruvbox-fgDim mt-1 leading-relaxed">
                  {selectedNode.description}
                </p>
              )}
            </div>

            {/* If Document Node, direct button to Reviewer */}
            {selectedNode.category === 'document' && (
              <button
                onClick={() => onSelectDoc(selectedNode.docId)}
                className="w-full py-2.5 px-4 rounded-lg bg-gruvbox-yellow hover:bg-gruvbox-yellowDim text-gruvbox-bgHard font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-glass-glow-yellow"
              >
                <BookOpen className="w-4 h-4" /> Open Full Reviewer Studio
              </button>
            )}

            {/* Connected Documents List */}
            <div>
              <h4 className="text-xs font-mono font-bold text-gruvbox-gray uppercase tracking-wider mb-2">
                Connected Knowledge ({connectedDocuments.length})
              </h4>
              <div className="space-y-2">
                {connectedDocuments.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    className="p-2.5 rounded-lg bg-gruvbox-bg/70 hover:bg-gruvbox-bg border border-gruvbox-bg1 hover:border-gruvbox-yellow/40 cursor-pointer transition-all flex items-start gap-2 group"
                  >
                    <div className="mt-0.5 text-gruvbox-yellow">
                      {doc.type === 'pdf' ? <FileText className="w-3.5 h-3.5 text-gruvbox-red" /> : doc.type === 'youtube' ? <YouTubeIcon className="w-3.5 h-3.5 text-gruvbox-orange" /> : <BookOpen className="w-3.5 h-3.5 text-gruvbox-blue" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-gruvbox-fg group-hover:text-gruvbox-yellow font-medium truncate">
                        {doc.title}
                      </p>
                      <p className="text-[10px] font-mono text-gruvbox-gray mt-0.5 line-clamp-2">
                        {doc.reviewer?.executiveSummary || 'No summary'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gruvbox-bg1 text-[11px] font-mono text-gruvbox-gray flex items-center justify-between">
            <span>SynapseVault Graph Node</span>
            <span className="text-gruvbox-aqua">Obsidian Compatible</span>
          </div>
        </div>
      )}
    </div>
  );
}
