export default function HistorySidebar({ open, onClose, history, onSelect }) {
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-72 z-[90] bg-black/85 backdrop-blur-xl border-l border-cyan-500/20 transition-transform duration-500 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-cyan-400 font-semibold">Scan History</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          {history.length === 0 && (
            <p className="text-gray-600 text-sm text-center mt-10">No scans yet this session.</p>
          )}
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="w-full text-left border border-white/10 rounded-lg p-3 hover:border-cyan-500/40 hover:bg-white/5 transition"
            >
              <p className="text-sm text-gray-200 font-medium truncate">{h.target}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{h.timestamp}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    h.risk === 'High'
                      ? 'bg-red-500/20 text-red-400'
                      : h.risk === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {h.risk}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {open && <div className="fixed inset-0 z-[80] bg-black/40" onClick={onClose} />}
    </>
  );
}
