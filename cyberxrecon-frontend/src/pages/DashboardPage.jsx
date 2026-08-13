import { useState, useRef, useEffect } from 'react';
import { moduleDetails, moduleOrder } from '../data/moduleData';
import RadarScanner from '../components/dashboard/RadarScanner';
import ModuleDetailModal from '../components/dashboard/ModuleDetailModal';
import HistorySidebar from '../components/dashboard/HistorySidebar';
import GraphViewPage from '../components/graph/GraphViewPage';

// ── System clock ───────────────────────────────────────────────────────────────
function SysClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-cyan-400/60 text-[10px] tracking-widest">
      {time.toLocaleTimeString('en-GB', { hour12: false })} UTC
    </span>
  );
}

// ── Top status bar item ─────────────────────────────────────────────────────────
function StatusPill({ label, value, color = 'cyan' }) {
  const c = { cyan: 'text-cyan-400', green: 'text-green-400', yellow: 'text-yellow-400', purple: 'text-purple-400' };
  return (
    <div className="flex flex-col items-center min-w-[64px]">
      <span className={`font-mono font-black text-base leading-none ${c[color]}`}>{value}</span>
      <span className="font-mono text-gray-600 text-[8px] uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

// ── Result data card (holographic slide-in) ────────────────────────────────────
function ResultCard({ moduleKey, delay }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(id);
  }, [delay]);

  if (!visible) return null;
  const mod = moduleDetails[moduleKey];
  if (!mod) return null;

  const accentMap = {
    ports: 'cyan', subdomains: 'purple', emails: 'cyan',
    breach: 'red', social: 'purple', phone: 'cyan',
  };
  const accent = accentMap[moduleKey] || 'cyan';
  const accentColor = { cyan: '#22d3ee', purple: '#a855f7', red: '#ef4444' }[accent];
  const accentBorder = { cyan: 'rgba(34,211,238,0.3)', purple: 'rgba(168,85,247,0.3)', red: 'rgba(239,68,68,0.3)' }[accent];
  const accentGlow   = { cyan: 'rgba(34,211,238,0.06)', purple: 'rgba(168,85,247,0.06)', red: 'rgba(239,68,68,0.06)' }[accent];

  return (
    <div
      className="result-card rounded-xl border bg-black/70 backdrop-blur-sm overflow-hidden"
      style={{
        borderColor: accentBorder,
        boxShadow: `0 0 30px ${accentGlow}, inset 0 0 20px ${accentGlow}`,
        animation: 'resultSlideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: accentBorder, background: `${accentGlow}` }}>
        {/* HUD corner bracket */}
        <span className="text-base leading-none">{mod.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-mono font-black text-[10px] uppercase tracking-widest" style={{ color: accentColor }}>
            {mod.title}
          </div>
          <div className="font-mono text-gray-600 text-[8px] tracking-wide truncate">{mod.summary}</div>
        </div>
        <span className="text-[7px] font-mono font-bold px-1.5 py-0.5 rounded border" style={{ color: '#22c55e', borderColor: 'rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
          ● LIVE
        </span>
      </div>
      {/* Card rows */}
      <div className="px-4 py-2 space-y-1">
        {mod.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2 font-mono text-[9px] leading-relaxed">
            <span style={{ color: accentColor }} className="shrink-0 mt-0.5">›</span>
            <span className="text-gray-300">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Risk badge ─────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.3)',  label: 'LOW RISK',    icon: '✓' },
    Medium: { color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.3)',  label: 'MEDIUM',      icon: '●' },
    High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)',  label: 'HIGH THREAT', icon: '⚠' },
  };
  const c = cfg[level] || cfg.Medium;
  return (
    <div
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg border font-mono"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <span style={{ color: c.color, fontSize: 18 }}>{c.icon}</span>
      <div>
        <div className="text-[8px] text-gray-500 uppercase tracking-widest">Threat Assessment</div>
        <div className="font-black text-sm tracking-widest" style={{ color: c.color }}>{c.label}</div>
      </div>
    </div>
  );
}

// ── ProgressBar ─────────────────────────────────────────────────────────────────
function ProgressBar({ progress }) {
  return (
    <div className="h-[2px] w-full bg-white/[0.04] rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 transition-all duration-500 ease-out"
        style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
      />
    </div>
  );
}

// ── Main DashboardPage ─────────────────────────────────────────────────────────
export default function DashboardPage({ initialTarget, autoStartScan, clearAutoStart }) {
  const [target, setTarget]               = useState(initialTarget || '');
  const [running, setRunning]             = useState(false);
  const [podStages, setPodStages]         = useState(Object.fromEntries(moduleOrder.map(k => [k, 'hidden'])));
  const [progress, setProgress]           = useState(0);
  const [riskLevel, setRiskLevel]         = useState(null);
  const [openModule, setOpenModule]       = useState(null);
  const [historyOpen, setHistoryOpen]     = useState(false);
  const [scanHistory, setScanHistory]     = useState([]);
  const [graphOpen, setGraphOpen]         = useState(false);
  const [completedMods, setCompletedMods] = useState([]);
  const [copyStatus, setCopyStatus]       = useState('COPY');
  const [logLines, setLogLines]           = useState([
    '// CyberXRecon v1.0 — system online.',
    '// Awaiting target acquisition...',
  ]);
  const logRef = useRef(null);

  const pushLog = (line) => {
    setLogLines(prev => [...prev.slice(-60), line]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 12);
  };

  const runScan = (overrideTarget) => {
    if (running) return;
    const activeTarget = (overrideTarget !== undefined ? overrideTarget : target).trim() || 'target.com';
    if (overrideTarget !== undefined) setTarget(overrideTarget);

    setRunning(true);
    setPodStages(Object.fromEntries(moduleOrder.map(k => [k, 'hidden'])));
    setProgress(0);
    setRiskLevel(null);
    setCompletedMods([]);
    setCopyStatus('COPY');
    setLogLines([]);

    const total = 2 + moduleOrder.length + 2;
    let done = 0;
    const bump = () => { done++; setProgress(Math.round((done / total) * 100)); };

    let delay = 0;
    const sched = (fn, wait) => { delay += wait; setTimeout(fn, delay); };

    sched(() => { pushLog(`> [INIT]  Target locked — ${activeTarget}`); bump(); }, 300);
    sched(() => { pushLog(`> [SYS]   Deploying ${moduleOrder.length} passive recon modules...`); bump(); }, 500);

    moduleOrder.forEach((key, i) => {
      sched(() => {
        pushLog(`> [${String(i + 1).padStart(2, '0')}]   ${moduleDetails[key].title} ENGAGED`);
        setPodStages(p => ({ ...p, [key]: 'visible' }));
        bump();
      }, 700);
    });

    sched(() => {
      pushLog('> [OK]    All modules complete — compiling intelligence...');
      moduleOrder.forEach(k => setCompletedMods(prev => [...prev, k]));
      const risk = 'Medium';
      setRiskLevel(risk);
      setScanHistory(prev => [{ id: Date.now(), target: activeTarget, timestamp: new Date().toLocaleString(), risk }, ...prev]);
      pushLog(`> [DONE]  Report ready. ${moduleOrder.length} modules, ${moduleOrder.reduce((s, k) => s + moduleDetails[k].items.length, 0)} records extracted.`);
      bump(); bump();
      setRunning(false);
    }, 900);
  };

  useEffect(() => {
    if (initialTarget) setTarget(initialTarget);
    if (autoStartScan && initialTarget) { clearAutoStart(); runScan(initialTarget); }
  }, [initialTarget, autoStartScan]);

  const handleCopy = async () => {
    try {
      const text = moduleOrder.map(k => `=== ${moduleDetails[k].title} ===\n${moduleDetails[k].items.join('\n')}`).join('\n\n');
      await navigator.clipboard.writeText(text);
      setCopyStatus('✓ OK');
    } catch { setCopyStatus('ERR'); }
    setTimeout(() => setCopyStatus('COPY'), 1800);
  };

  const handleDownload = () => {
    const report = {
      target: target.trim() || 'target.com',
      generatedAt: new Date().toISOString(),
      riskLevel,
      modules: Object.fromEntries(moduleOrder.map(k => [k, moduleDetails[k].items])),
    };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    a.download = `cyberxrecon-${Date.now()}.json`;
    a.click();
  };

  const scanComplete = !running && riskLevel !== null;

  return (
    <>
      {/* ── Full HUD page wrapper ──────────────────────────── */}
      <div className="flex flex-col gap-4 max-w-[1400px] mx-auto">

        {/* ── TOP SYSTEM STATUS BAR ─────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-3 rounded-xl border border-cyan-500/15 bg-black/50 backdrop-blur-md">
          {/* Left: system label */}
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full" />
            <div>
              <div className="font-mono font-black text-xs text-cyan-400 tracking-[0.25em] uppercase glitch-title">
                CyberXRecon · Operator Console
              </div>
              <div className="font-mono text-gray-600 text-[9px] tracking-widest mt-0.5">
                PASSIVE RECON ENGINE v1.0 · {running ? '⬤ ACTIVE SWEEP' : scanComplete ? '◎ SWEEP COMPLETE' : '○ STANDBY'}
              </div>
            </div>
          </div>

          {/* Center pills */}
          <div className="hidden lg:flex items-center gap-6 px-8">
            <StatusPill label="MODULES" value="6" color="cyan" />
            <div className="w-px h-8 bg-white/5" />
            <StatusPill label="STATUS" value={running ? 'SCAN' : scanComplete ? 'DONE' : 'IDLE'} color={running ? 'yellow' : scanComplete ? 'green' : 'cyan'} />
            <div className="w-px h-8 bg-white/5" />
            <StatusPill label="RECORDS" value={scanComplete ? `${moduleOrder.reduce((s, k) => s + moduleDetails[k].items.length, 0)}` : '—'} color="purple" />
          </div>

          {/* Right: clock + buttons */}
          <div className="flex items-center gap-3">
            <SysClock />
            <button
              id="dashboard-history-btn"
              onClick={() => setHistoryOpen(true)}
              className="px-3 py-1.5 text-[9px] font-mono border border-white/10 text-gray-400 rounded-lg hover:text-cyan-400 hover:border-cyan-400/40 bg-black/60 transition-all whitespace-nowrap tracking-widest uppercase"
            >
              ⏱ HISTORY {scanHistory.length > 0 && `(${scanHistory.length})`}
            </button>
          </div>
        </div>

        {/* ── PROGRESS BAR ──────────────────────────────────── */}
        <ProgressBar progress={progress} />

        {/* ── MAIN LAYOUT ───────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

          {/* ── LEFT COLUMN: radar + input + log ──────────────── */}
          <div className="flex flex-col gap-5">

            {/* TARGET INPUT ROW */}
            <div className="flex gap-3 items-stretch">
              <div className="flex-1 relative group">
                {/* HUD brackets */}
                <span className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-cyan-500/40 pointer-events-none" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-cyan-500/40 pointer-events-none" />
                <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-cyan-500/40 pointer-events-none" />
                <span className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-cyan-500/40 pointer-events-none" />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-400/50 text-sm font-mono pointer-events-none select-none">›</span>
                <input
                  id="dashboard-target-input"
                  type="text"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !running && runScan()}
                  placeholder="Enter target domain, IP, username or email..."
                  className="w-full pl-9 pr-5 py-3.5 bg-black/80 border border-cyan-500/20 rounded-xl text-gray-100 text-sm font-mono placeholder-gray-700 focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 transition-all group-hover:border-cyan-500/30"
                />
              </div>

              {/* ENGAGE */}
              <button
                id="dashboard-engage-btn"
                onClick={() => runScan()}
                disabled={running}
                className={`relative px-8 py-3 font-mono font-black text-xs uppercase tracking-[0.2em] rounded-xl transition-all duration-300 overflow-hidden whitespace-nowrap border-2 group
                  ${running
                    ? 'bg-black border-white/[0.06] text-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-br from-cyan-950/50 to-purple-950/50 border-cyan-400/50 text-cyan-300 hover:border-cyan-300 hover:text-white hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] engage-idle active:scale-95'
                  }`}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                {running ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    SCANNING
                  </span>
                ) : '⚡ ENGAGE'}
              </button>
            </div>

            {/* RADAR */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Radar panel glow backdrop */}
                <div className="absolute inset-0 rounded-2xl" style={{ boxShadow: '0 0 80px rgba(34,211,238,0.04)', background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.02) 0%, transparent 70%)' }} />
                <RadarScanner
                  target={target.trim()}
                  scanning={running}
                  podStages={podStages}
                  onPodClick={setOpenModule}
                />
              </div>
            </div>

            {/* Status line */}
            <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] text-center">
              {running
                ? '⬤ PASSIVE RECON SWEEP IN PROGRESS — DO NOT CLOSE'
                : scanComplete
                ? `◎ SWEEP COMPLETE — CLICK ANY ACTIVE POD TO INSPECT MODULE DATA`
                : '○ AWAITING TARGET — ENTER DOMAIN OR IP AND PRESS ENGAGE'}
            </p>

            {/* MINI LOG (scrolling) */}
            <div className="rounded-xl border border-cyan-500/15 bg-black/70 backdrop-blur-md overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2 border-b border-cyan-500/10 bg-black/40">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
                <span className="font-mono text-[9px] text-cyan-400/50 uppercase tracking-[0.2em] ml-2">
                  {running ? '● SYSTEM LOG — LIVE' : '○ SYSTEM LOG'}
                </span>
                {scanComplete && (
                  <div className="ml-auto flex gap-2">
                    <button
                      id="dashboard-copy-btn"
                      onClick={handleCopy}
                      className="px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-cyan-500/30 text-cyan-400 bg-cyan-950/20 hover:bg-cyan-500/15 hover:border-cyan-400 transition-all"
                    >{copyStatus}</button>
                    <button
                      id="dashboard-download-btn"
                      onClick={handleDownload}
                      className="px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-purple-500/30 text-purple-400 bg-purple-950/20 hover:bg-purple-500/15 hover:border-purple-400 transition-all"
                    >↓ JSON</button>
                    <button
                      id="dashboard-graph-btn"
                      onClick={() => setGraphOpen(true)}
                      className="px-2.5 py-1 text-[8px] font-mono font-bold uppercase tracking-widest rounded border border-cyan-400/40 text-cyan-200 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 hover:border-cyan-300 transition-all relative"
                    >
                      🕸 GRAPH
                      <span className="absolute -top-1.5 -right-1 text-[5px] px-1 bg-black rounded font-extrabold text-cyan-400 border border-cyan-500/30">PRO</span>
                    </button>
                  </div>
                )}
              </div>
              <pre
                ref={logRef}
                className="p-4 min-h-[80px] max-h-[140px] overflow-y-auto text-[9.5px] font-mono leading-relaxed whitespace-pre-wrap"
              >
                {logLines.map((line, i) => {
                  let cls = 'text-cyan-400/55';
                  if (line.match(/\[INIT\]|\[SYS\]/)) cls = 'text-cyan-300';
                  if (line.match(/ENGAGED/))           cls = 'text-yellow-400';
                  if (line.match(/\[OK\]|\[DONE\]/i))  cls = 'text-green-400';
                  if (line.match(/Error|FAIL/i))        cls = 'text-red-400';
                  return <div key={i} className={`${cls} leading-[1.7]`}>{line}</div>;
                })}
                {running && <span className="text-cyan-400 animate-pulse">▋</span>}
              </pre>
            </div>
          </div>

          {/* ── RIGHT COLUMN: intel cards ──────────────────────── */}
          <div className="flex flex-col gap-3">

            {/* Intel panel header */}
            <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/[0.06] bg-black/50">
              <div>
                <div className="font-mono text-[9px] text-gray-600 uppercase tracking-widest">INTELLIGENCE OUTPUT</div>
                <div className="font-mono text-xs text-white/70 font-bold mt-0.5">
                  {scanComplete ? `${moduleOrder.length} modules · ${moduleOrder.reduce((s, k) => s + moduleDetails[k].items.length, 0)} records` : 'Awaiting sweep...'}
                </div>
              </div>
              {scanComplete && <RiskBadge level={riskLevel} />}
            </div>

            {/* No-scan idle state */}
            {!running && !scanComplete && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 rounded-xl border border-dashed border-white/[0.06] bg-black/20">
                <div className="text-6xl opacity-10 text-cyan-400">◎</div>
                <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-gray-700 text-center leading-relaxed max-w-[200px]">
                  No active scan<br />Enter a target &amp; press engage
                </p>
              </div>
            )}

            {/* Scanning in-progress skeleton placeholders */}
            {running && moduleOrder.map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl border border-white/[0.04] bg-black/40 animate-pulse"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}

            {/* Result cards — slide in one by one after scan */}
            {scanComplete && completedMods.map((key, i) => (
              <ResultCard key={key} moduleKey={key} delay={i * 90} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────── */}
      <ModuleDetailModal moduleKey={openModule} onClose={() => setOpenModule(null)} />

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={scanHistory}
        onSelect={h => { setTarget(h.target); setHistoryOpen(false); }}
      />

      {graphOpen && (
        <GraphViewPage
          target={target.trim() || 'target.com'}
          onClose={() => setGraphOpen(false)}
        />
      )}
    </>
  );
}
