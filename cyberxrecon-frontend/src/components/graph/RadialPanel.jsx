import { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { hudAudio } from '../../utils/hudAudio';

export default function RadialPanel({ data }) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  
  const [dims, setDims] = useState({ w: 400, h: 300 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverNode, setHoverNode] = useState(null);
  
  // --- SONAR RADAR ADVANCED STATES ---
  const [contextMenu, setContextMenu] = useState(null); // { x, y, node }
  const [sweepSpeed, setSweepSpeed] = useState(1.0); // Interactive needle speed multiplier
  const [scanningNodeId, setScanningNodeId] = useState(null); // Node undergoing deep scan

  const nodeR = 115; // Primary ring radius

  // Convert static data on target change to local React State safely
  const initialData = useMemo(() => {
    // --- ABSOLUTE SAFETY GUARD ---
    if (!data || !data.modules || !data.target) {
      return { nodes: [], links: [] };
    }

    const nodes = [
      { id: 'radar-target', label: data.target, group: 1, x: 0, y: 0, fx: 0, fy: 0, color: '#22d3ee', icon: '🎯' }
    ];
    const links = [];

    // Flatten findings with their original item indices safely
    const flat = [];
    const modulesList = data.modules || [];
    modulesList.forEach((m) => {
      if (m && m.items) {
        m.items.forEach((item, itemIdx) => flat.push({ module: m, item, itemIdx }));
      }
    });
    const total = flat.length;

    // Distribute nodes evenly on concentric ring
    flat.forEach((f, i) => {
      const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * nodeR;
      const y = Math.sin(angle) * nodeR;
      
      const nodeId = `${f.module.key}-${f.itemIdx}`;

      nodes.push({
        id: nodeId,
        label: f.item,
        group: 3,
        color: f.module.color,
        icon: f.module.icon,
        moduleTitle: f.module.title,
        moduleKey: f.module.key,
        angle,
        x,
        y,
        fx: x, // Lock to polar coordinate space
        fy: y
      });

      links.push({ source: 'radar-target', target: nodeId, color: f.module.color, isSpoke: true });
    });

    return { nodes, links };
  }, [data]);

  const [radarState, setRadarState] = useState({ nodes: [], links: [] });

  // Safe State loader with validation check
  useEffect(() => {
    if (!initialData || !initialData.nodes) return;
    setRadarState({
      nodes: initialData.nodes.map(n => ({ ...n })),
      links: (initialData.links || []).map(l => ({ ...l }))
    });
    setSelectedNode(null);
    setContextMenu(null);
  }, [initialData]);

  // STALE CLOSURE FIX: TRACK LATEST NODES VIA REF
  const nodesRef = useRef([]);
  useEffect(() => {
    nodesRef.current = radarState.nodes || [];
  }, [radarState.nodes]);

  // CROSS-PANEL CLICK SYNC LISTENER (Ref-based, completely crash-proof)
  useEffect(() => {
    const handleGlobalFocus = (event) => {
      const { id } = event.detail;
      const node = nodesRef.current.find(n => n.id === id);
      if (node && graphRef.current && typeof graphRef.current.centerAt === 'function') {
        setSelectedNode(node);
        graphRef.current.centerAt(node.x, node.y, 1000);
        graphRef.current.zoom(2.5, 1000);
        hudAudio.playClick();
      }
    };

    window.addEventListener('cyberxrecon-focus', handleGlobalFocus);
    return () => window.removeEventListener('cyberxrecon-focus', handleGlobalFocus);
  }, []);

  // Handle Resize safely
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        setDims({ w: width, h: height });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Fit viewport on load
  useEffect(() => {
    const t = setTimeout(() => {
      if (graphRef.current && typeof graphRef.current.zoomToFit === 'function') {
        graphRef.current.zoomToFit(400, 36);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [dims]);

  // --- DEEP SIGNAL SCAN (Interactive Node & Link Spawning) ---
  const handleDeepScan = (node) => {
    if (scanningNodeId) return; // Prevent double trigger
    
    setScanningNodeId(node.id);
    setSweepSpeed(6.0); // Dynamic needle speed-up (Aggressive scan visual)
    hudAudio.playSweep();

    // 1.5s high-intensity scan simulation
    setTimeout(() => {
      const timestamp = Date.now();
      const parentAngle = node.angle || (Math.random() * Math.PI * 2);

      // Create 2 nested sub-signal blips further out on the same radial vector
      const childRadius = nodeR + 32;
      const childAngle1 = parentAngle - 0.12;
      const childAngle2 = parentAngle + 0.12;

      const subNode1 = {
        id: `sub-sig-1-${timestamp}`,
        label: `Port metadata: SSH-Banner-2.0`,
        group: 3,
        color: node.color,
        icon: '🔑',
        angle: childAngle1,
        x: Math.cos(childAngle1) * childRadius,
        y: Math.sin(childAngle1) * childRadius,
        fx: Math.cos(childAngle1) * childRadius,
        fy: Math.sin(childAngle1) * childRadius
      };

      const subNode2 = {
        id: `sub-sig-2-${timestamp}`,
        label: `Active vulnerability: CVE-2022-XXXX`,
        group: 3,
        color: '#f43f5e', // Critical red
        icon: '🔥',
        angle: childAngle2,
        x: Math.cos(childAngle2) * childRadius,
        y: Math.sin(childAngle2) * childRadius,
        fx: Math.cos(childAngle2) * childRadius,
        fy: Math.sin(childAngle2) * childRadius
      };

      setRadarState(prev => ({
        nodes: [...prev.nodes, subNode1, subNode2],
        links: [
          ...prev.links,
          { source: node.id, target: subNode1.id, color: node.color, isSpoke: false },
          { source: node.id, target: subNode2.id, color: '#f43f5e', isSpoke: false }
        ]
      }));

      // Reset Scanner Speed
      setSweepSpeed(1.0);
      setScanningNodeId(null);
      hudAudio.playSuccess();
    }, 1600);
  };

  // Pre-Render Canvas Frame (Safe from NaN and Division-by-Zero)
  const drawRadarGrid = (ctx, globalScale) => {
    ctx.save();

    const currentScale = globalScale || 1; // Safely guards canvas calculations

    // Concentric sonar rings
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.lineWidth = 1.2 / currentScale;
    
    [35, 75, nodeR, nodeR + 32].forEach(r => {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // Crosshairs
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.05)';
    ctx.beginPath();
    ctx.moveTo(-160, 0); ctx.lineTo(160, 0);
    ctx.moveTo(0, -160); ctx.lineTo(0, 160);
    ctx.stroke();

    // --- BUTTERY-SMOOTH ROTATING NEEDLE ---
    ctx.beginPath();
    const rotationAngle = (performance.now() / (1250 / sweepSpeed)) % (Math.PI * 2);
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(rotationAngle) * (nodeR + 32), Math.sin(rotationAngle) * (nodeR + 32));
    ctx.strokeStyle = scanningNodeId ? 'rgba(34, 211, 238, 0.75)' : 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = (scanningNodeId ? 2.5 : 1.5) / currentScale;
    ctx.stroke();

    ctx.restore();
  };

  // Node Canvas Object painter (Safe from NaN and Division-by-Zero)
  const nodeCanvasObject = (node, ctx, globalScale) => {
    const isTarget = node.group === 1;
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isScanningNode = scanningNodeId === node.id;

    const currentScale = globalScale || 1; // Safe Scale Guard

    ctx.save();

    const hasFocus = hoverNode !== null;
    ctx.globalAlpha = !hasFocus || hoverNode.id === node.id ? 1.0 : 0.18;

    if (isTarget) {
      // Main center hub
      ctx.beginPath();
      ctx.arc(node.x, node.y, 16, 0, 2 * Math.PI);
      ctx.fillStyle = '#06060c';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#22d3ee';
      ctx.stroke();

      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.icon, node.x, node.y);
    } else {
      // Dynamic scanning pulse ring
      if (isScanningNode) {
        ctx.beginPath();
        const scanPulse = 6 + (performance.now() / 60) % 24;
        ctx.arc(node.x, node.y, scanPulse, 0, 2 * Math.PI);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1.8 / currentScale;
        ctx.stroke();
      }

      // Hover / Selection Pulse
      if ((isHovered || isSelected) && !isScanningNode) {
        ctx.beginPath();
        const pulseR = 6 + (performance.now() / 150) % 12;
        ctx.arc(node.x, node.y, pulseR, 0, 2 * Math.PI);
        ctx.strokeStyle = node.color || '#a855f7';
        ctx.lineWidth = 1 / currentScale;
        ctx.stroke();

        // Locked HUD tracking reticle
        ctx.strokeStyle = node.color || '#a855f7';
        ctx.lineWidth = 1.2 / currentScale;
        ctx.beginPath();
        const offset = 8;
        ctx.moveTo(node.x - offset, node.y - 4); ctx.lineTo(node.x - offset, node.y - offset); ctx.lineTo(node.x - 4, node.y - offset);
        ctx.moveTo(node.x + offset, node.y - 4); ctx.lineTo(node.x + offset, node.y - offset); ctx.lineTo(node.x + 4, node.y - offset);
        ctx.moveTo(node.x - offset, node.y + 4); ctx.lineTo(node.x - offset, node.y + offset); ctx.lineTo(node.x - 4, node.y + offset);
        ctx.moveTo(node.x + offset, node.y + 4); ctx.lineTo(node.x + offset, node.y + offset); ctx.lineTo(node.x + 4, node.y + offset);
        ctx.stroke();
      }

      // Base radar dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, isHovered || isSelected ? 5.5 : 3.8, 0, 2 * Math.PI);
      ctx.fillStyle = isHovered || isSelected ? '#ffffff' : node.color || '#a855f7';
      ctx.fill();
      if (isHovered || isSelected) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = node.color;
        ctx.stroke();
      }
    }

    ctx.restore();
  };

  const handleNodeClick = (node) => {
    hudAudio.playClick();
    setSelectedNode(node);
    setContextMenu(null);
  };

  // Right-click context menu
  const renderContextMenu = () => {
    if (!contextMenu) return null;

    const node = contextMenu.node;
    if (node.group === 1) return null;

    return (
      <div 
        className="absolute bg-[#080812]/95 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl z-[300] w-48 font-mono text-[9px] shadow-black/80 animate-fade-in"
        style={{ top: contextMenu.y, left: contextMenu.x }}
      >
        <button 
          onClick={() => {
            setContextMenu(null);
            handleDeepScan(node);
          }}
          className="w-full text-left px-2 py-1.5 hover:bg-cyan-500/10 hover:text-cyan-400 text-gray-300 rounded transition cursor-pointer flex items-center gap-1.5"
        >
          ⚡ Sector Deep Scan
        </button>
        <div className="border-t border-white/5 my-1" />
        <button 
          onClick={() => setContextMenu(null)}
          className="w-full text-left px-2 py-1 text-red-400 hover:bg-red-500/5 rounded transition cursor-pointer"
        >
          ✕ Cancel
        </button>
      </div>
    );
  };

  const modulesList = data?.modules || []; // Safe Prop Fallback

  return (
    <div className="relative bg-[#020205]/60 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 select-none">
      
      {/* HUD Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-black/40 z-10">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 animate-pulse">📡</span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Target Sonar Scan</h3>
        </div>
        <button
          onClick={() => {
            hudAudio.playSweep();
            setSweepSpeed(prev => (prev === 1.0 ? 3.0 : 1.0));
          }}
          className="px-2 py-0.5 border border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded text-[8px] font-bold font-mono transition cursor-pointer"
        >
          {sweepSpeed > 1.0 ? '⚡ SWEEP HIGH-SPEED' : '🔄 ADJUST ROTATION'}
        </button>
      </div>

      {/* Radar Canvas Frame */}
      <div ref={containerRef} className="flex-1 relative min-h-0">
        {modulesList.length > 0 ? (
          <ForceGraph2D
            ref={graphRef}
            width={dims.w}
            height={dims.h}
            graphData={radarState}
            onRenderFramePre={drawRadarGrid}
            nodeCanvasObject={nodeCanvasObject}
            onNodeClick={handleNodeClick}
            onNodeHover={(node) => setHoverNode(node || null)}
            
            // Maltego right click transforms inside Sonar
            onNodeRightClick={(node, event) => {
              event.preventDefault();
              const rect = containerRef.current.getBoundingClientRect();
              setContextMenu({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                node
              });
              hudAudio.playClick();
            }}
            onBackgroundClick={() => {
              setContextMenu(null);
            }}
            
            backgroundColor="rgba(0,0,0,0)"
            
            linkColor={(link) => {
              const isHovered = hoverNode && (hoverNode.id === link.source.id || hoverNode.id === link.target.id);
              if (hoverNode) {
                return isHovered ? 'rgba(34, 211, 238, 0.7)' : 'rgba(255,255,255,0.015)';
              }
              return link.isSpoke ? 'rgba(34, 211, 238, 0.1)' : 'rgba(168, 85, 247, 0.25)';
            }}
            linkWidth={(link) => (link.isSpoke ? 0.8 : 1.2)}
            
            // --- BUTTERY SMOOTH REDRAW LOOP ---
            cooldownTicks={Infinity} 
            cooldownTime={Infinity}  
            
            enableZoom={true}
            enablePan={true}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10px] text-gray-500 animate-pulse">
            Waiting for Sonar telemetry...
          </div>
        )}

        {/* Floating Context Menu */}
        {renderContextMenu()}

        {/* HUD Floating Analysis Overlay */}
        {selectedNode && selectedNode.group !== 1 && (
          <div className="absolute bottom-3 left-3 right-3 bg-[#05050a]/95 border border-purple-500/20 rounded-xl p-3 shadow-2xl shadow-black/95 animate-fade-in font-mono z-20">
            <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-2">
              <span className="text-[8px] text-purple-400 font-bold uppercase tracking-wider">
                [TRACKED BLIP SPECIFICATIONS]
              </span>
              <button 
                onClick={() => setSelectedNode(null)}
                className="text-gray-500 hover:text-white text-[10px] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                {selectedNode.icon}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-[8px] text-gray-500 uppercase font-bold tracking-widest block">
                  {selectedNode.moduleTitle || 'Sub-Signal Indicator'}
                </span>
                <p className="text-xs text-cyan-400 font-bold truncate mt-0.5">
                  {selectedNode.label}
                </p>
              </div>
            </div>

            {/* DEEP SCAN HUD BUTTON */}
            <div className="mt-2.5 pt-2 border-t border-white/5">
              <button
                onClick={() => handleDeepScan(selectedNode)}
                disabled={scanningNodeId !== null}
                className={`w-full py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  scanningNodeId 
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse' 
                    : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20'
                }`}
              >
                {scanningNodeId ? '🛰️ RUNNING EXTRAPOLATION...' : '⚡ Run Deep Signal Scan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}