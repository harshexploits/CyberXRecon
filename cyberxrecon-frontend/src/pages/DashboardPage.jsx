import { useState, useRef } from 'react';
import { moduleDetails, moduleOrder } from '../data/moduleData';
import ResultPopup from '../components/dashboard/ResultPopup';
import ModuleDetailModal from '../components/dashboard/ModuleDetailModal';
import HistorySidebar from '../components/dashboard/HistorySidebar';
import GraphViewPage from '../components/graph/GraphViewPage';

export default function DashboardPage() {
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    'CyberXRecon terminal ready.',
    'Enter a target above and click "Run Scan" to begin.',
  ]);
  const [popupStage, setPopupStage] = useState({
    ports: 'hidden', subdomains: 'hidden', phone: 'hidden', social: 'hidden', emails: 'hidden', breach: 'hidden',
  });
  const [mergeTransforms, setMergeTransforms] = useState({});
  const [progress, setProgress] = useState(0);
  const [riskLevel, setRiskLevel] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy Report');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [graphOpen, setGraphOpen] = useState(false);

  const terminalRef = useRef(null);
  const popupNodeRefs = useRef({});
  const registerRef = (key, el) => { popupNodeRefs.current[key] = el; };

  const pushLine = (line) => setTerminalLines((prev) => [...prev, line]);

  const computeMergeTransform = (key) => {
    const popupEl = popupNodeRefs.current[key];
    const termEl = terminalRef.current;
    if (!popupEl || !termEl) return 'scale(0)';
    const popupRect = popupEl.getBoundingClientRect();
    const termRect = termEl.getBoundingClientRect();
    const dx = (termRect.left + termRect.width / 2) - (popupRect.left + popupRect.width / 2);
    const dy = (termRect.top + termRect.height / 2) - (popupRect.top + popupRect.height / 2);
    return `translate(${dx}px, ${dy}px) scale(0)`;
  };

  const runScan = () => {
    if (running) return;
    const t = target.trim() || 'target.com';

    setRunning(true);
    setTerminalLines([]);
    setPopupStage({ ports: 'hidden', subdomains: 'hidden', phone: 'hidden', social: 'hidden', emails: 'hidden', breach: 'hidden' });
    setMergeTransforms({});
    setProgress(0);
    setRiskLevel(null);
    setCopyStatus('Copy Report');

    const totalSteps = 2 + moduleOrder.length + 2;
    let stepsDone = 0;
    const bump = () => {
      stepsDone += 1;
      setProgress(Math.round((stepsDone / totalSteps) * 100));
    };

    let delay = 0;
    const schedule = (fn, wait) => {
      delay += wait;
      setTimeout(fn, delay);
    };

    schedule(() => { pushLine(`> Initializing scan on ${t}...`); bump(); }, 500);
    schedule(() => { pushLine(`> Deploying ${moduleOrder.length} recon modules...`); bump(); }, 700);

    moduleOrder.forEach((key, i) => {
      schedule(() => {
        pushLine(`> [${i + 1}/${moduleOrder.length}] ${moduleDetails[key].title} engaged`);
        setPopupStage((p) => ({ ...p, [key]: 'visible' }));
        bump();
      }, 700);
    });

    schedule(() => pushLine('> All modules complete. Merging results into report...'), 1500);

    schedule(() => {
      const transforms = {};
      moduleOrder.forEach((key) => { transforms[key] = computeMergeTransform(key); });
      setMergeTransforms(transforms);
      setPopupStage((p) => {
        const next = { ...p };
        moduleOrder.forEach((key) => (next[key] = 'merging'));
        return next;
      });
      bump();
    }, 500);

    schedule(() => {
      moduleOrder.forEach((key) => {
        pushLine(`—— ${moduleDetails[key].title} ——`);
        moduleDetails[key].items.forEach((item) => pushLine(`  ${item}`));
      });
      pushLine('> Scan complete. Report generated.');
      const risk = 'Medium';
      setRiskLevel(risk);
      setScanHistory((prev) => [
        { id: Date.now(), target: t, timestamp: new Date().toLocaleString(), risk },
        ...prev,
      ]);
      bump();
      setRunning(false);
    }, 1100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(terminalLines.join('\n'));
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Report'), 1800);
    } catch {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus('Copy Report'), 1800);
    }
  };

  const handleDownload = () => {
    const report = {
      target: target.trim() || 'target.com',
      generatedAt: new Date().toISOString(),
      riskLevel,
      modules: moduleOrder.reduce((acc, key) => {
        acc[key] = moduleDetails[key].items;
        return acc;
      }, {}),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberxrecon-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scanComplete = !running && riskLevel !== null;

  return (
    <div className="text-center max-w-5xl mx-auto pt-8 md:pt-12 px-4">
      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: floatBob 3.2s ease-in-out infinite; }
      `}</style>

      <div className="flex items-center justify-center gap-3">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">OSINT Dashboard</h2>
        <button
          onClick={() => setHistoryOpen(true)}
          className="text-xs px-3 py-1.5 border border-white/10 rounded-full text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 bg-white/[0.02] backdrop-blur-sm transition-all"
        >
          Anomalies History {scanHistory.length > 0 && `(${scanHistory.length})`}
        </button>
      </div>
      <p className="text-gray-400 mt-2 text-sm">Deploy automated target analysis and monitor real-time threat maps.</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 mt-10 max-w-lg mx-auto relative z-20">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 text-sm">🎯</div>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target domain, IP, email, or username..."
            className="w-full pl-10 pr-5 py-3 rounded-full bg-black/60 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300 shadow-inner"
          />
        </div>
        <button
          onClick={runScan}
          disabled={running}
          className={`px-8 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] ${
            running
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/20'
          }`}
        >
          {running ? 'Running Scans...' : 'Run Scan'}
        </button>
      </div>

      <div
        ref={terminalRef}
        className="crt-container crt-scanline relative z-10 mx-auto max-w-2xl bg-black/85 border border-cyan-500/35 rounded-xl p-5 text-left font-mono text-sm text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)] mt-16 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border border-cyan-500/10">
          <div className="flex space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-500/60 animate-pulse">Scanning Unit</span>
            {riskLevel && (
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide shadow-md border ${
                  riskLevel === 'High'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10 animate-pulse'
                    : riskLevel === 'Medium'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-yellow-500/10'
                    : 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-500/10'
                }`}
              >
                Risk: {riskLevel}
              </span>
            )}
          </div>
        </div>

        {(running || progress > 0) && (
          <div className="h-1.5 w-full bg-cyan-950/40 border border-cyan-500/15 rounded-full overflow-hidden mb-4 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <pre className="whitespace-pre-wrap min-h-[180px] max-h-80 overflow-y-auto pr-2 leading-relaxed text-cyan-400/90 text-xs md:text-sm selection:bg-cyan-500/20 select-text">
          {terminalLines.join('\n')}
          {running && <span className="animate-pulse">▋</span>}
        </pre>

        {scanComplete && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-cyan-500/15">
            <button
              onClick={handleCopy}
              className="flex-1 text-xs py-2.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all font-semibold uppercase tracking-wider"
            >
              {copyStatus}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 text-xs py-2.5 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all font-semibold uppercase tracking-wider"
            >
              Download JSON
            </button>
            <button
              onClick={() => setGraphOpen(true)}
              className="flex-1 text-xs py-2.5 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-300 hover:from-cyan-500/20 hover:to-purple-500/20 hover:border-cyan-300 transition-all flex items-center justify-center gap-1 font-bold uppercase tracking-wider"
            >
              🕸️ Maltego Intelligence Graph
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-black text-cyan-400 font-extrabold border border-cyan-500/30">PRO</span>
            </button>
          </div>
        )}
      </div>

      {moduleOrder.map((key) => (
        <ResultPopup
          key={key}
          corner={key}
          icon={moduleDetails[key].icon}
          title={moduleDetails[key].title}
          items={moduleDetails[key].items}
          stage={popupStage[key]}
          mergeTransform={mergeTransforms[key]}
          registerRef={registerRef}
          onOpen={setOpenModule}
        />
      ))}

      <ModuleDetailModal moduleKey={openModule} onClose={() => setOpenModule(null)} />

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={scanHistory}
        onSelect={(h) => {
          setTarget(h.target);
          setHistoryOpen(false);
        }}
      />

      {graphOpen && (
        <GraphViewPage target={target.trim() || 'target.com'} onClose={() => setGraphOpen(false)} />
      )}
    </div>
  );
}
