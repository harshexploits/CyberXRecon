const RISK_STYLE = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.22)' },
  Medium: { color: '#eab308', bg: 'rgba(234,179,8,0.08)',  border: 'rgba(234,179,8,0.22)' },
  Low:    { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.22)' },
};

export default function HistorySidebar({ open, onClose, history, onSelect }) {
  return (
    <>
      {/* ── Drawer ───────────────────────────────────── */}
      <div
        className={`fixed top-0 right-0 h-full w-80 z-[90] border-l border-cyan-500/12 bg-black/90 backdrop-blur-2xl
          transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/[0.05] bg-black/60 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-[0.2em]">
                Anomaly History
              </h3>
              <p className="text-[8.5px] text-gray-700 font-mono mt-0.5">
                {history.length} scan{history.length !== 1 ? 's' : ''} this session
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-white text-xs transition-colors mt-0.5"
              aria-label="Close history sidebar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full py-16 opacity-30">
              <div className="text-4xl mb-3 text-gray-700">◉</div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-gray-700">
                No scans yet
              </p>
            </div>
          )}

          {history.map(h => {
            const rs = RISK_STYLE[h.risk] || RISK_STYLE.Low;
            return (
              <button
                key={h.id}
                onClick={() => onSelect(h)}
                className="w-full text-left rounded-xl px-4 py-3 border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono text-gray-400 group-hover:text-white transition-colors truncate">
                    {h.target}
                  </span>
                  <span
                    className="text-[7.5px] px-2 py-0.5 rounded font-mono font-bold uppercase shrink-0"
                    style={{
                      color:      rs.color,
                      background: rs.bg,
                      border:     `1px solid ${rs.border}`,
                    }}
                  >
                    {h.risk}
                  </span>
                </div>
                <span className="text-[8.5px] text-gray-700 font-mono">{h.timestamp}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-[80] bg-black/25 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}
    </>
  );
}
