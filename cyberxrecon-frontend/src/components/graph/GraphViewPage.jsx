import React, { useState, useEffect, useRef } from 'react';
import { buildDashboardData } from '../../utils/graphUtils';
import { hudAudio } from '../../utils/hudAudio';
import NetworkGraphPanel from './NetworkGraphPanel';
import OverviewPanel from './OverviewPanel';
import TreePanel from './TreePanel';
import RadialPanel from './RadialPanel';

// --- ADVANCED CYBERXRECON SYSTEM DIAGNOSTIC (Error Boundary) ---
// If any grid panel crashes under the hood, this catches it and displays the exact JS error & stack trace
class GraphErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      hasError: true,
      error: error,
      errorInfo: errorInfo
    });
    console.error("Workspace System Halt Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 bg-[#030307] flex flex-col items-center justify-center p-6 text-red-400 font-mono z-[500] border border-red-500/20">
          <div className="w-full max-w-2xl bg-black/60 border border-red-500/30 rounded-xl p-6 shadow-2xl shadow-red-500/10 space-y-4">
            <div className="text-sm font-bold text-red-500 flex items-center gap-2">
              <span>⚠️</span> [CYBERXRECON WORKSPACE EXCEPTION DETECTED]
            </div>
            <div className="text-[10px] text-gray-500">// DIAGNOSTIC STACK TRACE</div>
            <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3 text-[10px] text-red-300 overflow-auto max-h-48 leading-relaxed font-mono">
              <p className="font-bold text-white">Exception: {this.state.error && this.state.error.toString()}</p>
              <pre className="mt-3 text-red-400/80 text-[9px]">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            <div className="text-[10px] text-gray-400 leading-normal">
              Bhai, is error screen ka text copy karke ya screenshot mujhe chat par bhejye. Main ise instantly line-to-line fix kar dunga!
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GraphViewPage({ target, onClose }) {
  const [phase, setPhase] = useState('loading');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportProgress, setReportProgress] = useState(null); // 'compiling', 'rendering', 'ready'
  
  const dashboardData = useRef(buildDashboardData(target));

  // Loading Terminal Boot Simulation (Labor Illusion)
  const bootLogs = [
    `[INFO] Initializing CyberXRecon query nodes on target: ${target}`,
    `[SYS] Spawning sandbox processes & active connection socket...`,
    `[SCAN] Resolving DNS mapping & subdomains via public directories...`,
    `[INTELLIGENCE] Interrogating open registries & public WHOIS endpoints...`,
    `[CORRELATION] Constructing multi-dimensional relationship matrices...`,
    `[SUCCESS] CyberXRecon target modeling completed. Launching HUD.`
  ];

  useEffect(() => {
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < bootLogs.length) {
        setTerminalLogs(prev => [...prev, bootLogs[logIndex]]);
        hudAudio.playClick();
        logIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('ready');
          hudAudio.playSuccess();
        }, 800);
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Mute Toggle Handler
  const handleMuteToggle = () => {
    const muted = hudAudio.toggleMute();
    setIsMuted(muted);
  };

  // Trigger Report compiling animation
  const triggerReportGeneration = () => {
    hudAudio.playSweep();
    setReportProgress('compiling');
    setShowReportModal(true);

    setTimeout(() => {
      hudAudio.playClick();
      setReportProgress('rendering');
    }, 1500);

    setTimeout(() => {
      hudAudio.playSuccess();
      setReportProgress('ready');
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#030307] text-gray-200 overflow-hidden select-none flex flex-col font-sans">
      
      {/* Dynamic Terminal Boot Loader */}
      {phase === 'loading' && (
        <div className="absolute inset-0 z-[250] bg-[#030307] flex flex-col items-center justify-center p-6">
          <div className="w-80 md:w-[480px] bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-cyan-500/90 shadow-2xl space-y-2 h-44 overflow-y-auto">
            <div className="text-gray-500">// CYBERXRECON VERIFYING WORKSPACE INTEGRITY</div>
            {terminalLogs.map((log, i) => (
              <div key={i} className="animate-fade-in leading-relaxed">
                <span className="text-purple-400">⚡</span> {log}
              </div>
            ))}
          </div>
          <p className="text-gray-500 text-[10px] tracking-wider uppercase mt-5 animate-pulse">
            Passive Scrape Engine Under Load...
          </p>
        </div>
      )}

      {/* Main Workspace Header */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 text-xs">
          <span className="text-cyan-400 font-bold flex items-center gap-2">
            🕸️ CyberXRecon Workspace
          </span>
          <span className="text-gray-700">|</span>
          <span className="text-gray-400 font-mono">Target: <strong className="text-white">{target}</strong></span>
        </div>

        {/* Workspace Quick Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMuteToggle}
            className="px-2.5 py-1 text-[10px] bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white transition cursor-pointer"
          >
            {isMuted ? '🔇 Audio Unmute' : '🔊 Audio Muted'}
          </button>
          
          <button
            onClick={triggerReportGeneration}
            className="px-3 py-1 text-[10px] bg-purple-500/10 border border-purple-500/30 hover:border-purple-400/60 text-purple-300 rounded-lg transition font-bold uppercase tracking-wider cursor-pointer"
          >
            📋 Generate Intelligence PDF
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 text-[10px] bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition font-semibold cursor-pointer"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* 4-Panel Grid Content wrapped in Diagnostic System */}
      {phase === 'ready' && (
        <GraphErrorBoundary>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden min-h-0">
            <NetworkGraphPanel target={target} />
            <OverviewPanel data={dashboardData.current} />
            <TreePanel data={dashboardData.current} />
            <RadialPanel data={dashboardData.current} />
          </div>
        </GraphErrorBoundary>
      )}

      {/* Global Telemetry Ticker (Marquee Footer) */}
      <div className="h-6 border-t border-white/5 bg-black/80 flex items-center shrink-0 overflow-hidden pointer-events-none font-mono text-[9px] text-gray-500 px-4">
        <div className="flex items-center gap-1.5 text-cyan-500/70 mr-4 font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-ping" />
          Live Threat Feed:
        </div>
        <div className="flex-1 overflow-hidden relative">
          <div className="absolute flex gap-12 whitespace-nowrap animate-marquee">
            <span>[INFO] Automated sweep passive lookup mapped 6 target indicators</span>
            <span>[WARNING] Outdated SSH Daemon found active on TCP Port 22</span>
            <span>[THREAT] Cross referencing targets matching breach catalogs (Collection #1)</span>
            <span>[SYS] Encryption nodes initialized on operational level clearance L2</span>
            <span>[RECON] IP trace successfully routed through Tor exit proxies</span>
          </div>
        </div>
      </div>

      {/* Gated PDF Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#07070e] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                // COMPILING EXECUTIVE INTEL REPORT
              </h3>
              {reportProgress === 'ready' && (
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="text-gray-400 hover:text-white transition text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {reportProgress !== 'ready' ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest animate-pulse">
                  {reportProgress === 'compiling' ? 'Formatting Threat Matrix...' : 'Rendering PDF Pages...'}
                </span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 border border-white/5 bg-[#0a0a14] rounded-lg p-4 font-mono text-[10px] text-gray-400 overflow-hidden relative min-h-[180px]">
                  <div className="border-b border-white/10 pb-2 mb-3">
                    <h4 className="text-xs text-white font-bold">CYBERXRECON DISCOVERY DOSSIER</h4>
                    <span className="text-[9px] text-gray-500">TARGET: {target}</span>
                  </div>
                  <div className="space-y-1.5 leading-relaxed">
                    <p>SYSTEM SUMMARY: Critical exposures tracked under active audit.</p>
                    <p>TOTAL CORRELATIONS: 25 high confidence nodes found.</p>
                    <div className="h-2 w-1/3 bg-gray-700/50 rounded" />
                    
                    <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/90 to-transparent flex flex-col items-center justify-end p-5 text-center">
                      <div className="backdrop-blur-sm bg-black/60 border border-purple-500/20 rounded-xl p-4 max-w-sm">
                        <span className="text-xl">🔒</span>
                        <h5 className="text-[11px] font-bold text-white uppercase tracking-wider mt-1.5">
                          Enterprise Access Required
                        </h5>
                        <p className="text-[9px] text-gray-400 mt-1 max-w-xs leading-normal">
                          Full vulnerability maps, credentials trace results, and raw mitigation steps are locked.
                        </p>
                        <button 
                          onClick={() => alert('SaaS Plan Selector is currently disabled.')}
                          className="mt-3 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-cyan-500 text-[10px] font-bold text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/20 transition cursor-pointer"
                        >
                          Unlock Report ($29)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}