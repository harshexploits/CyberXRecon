import { moduleDetails } from '../../data/moduleData';

const MODULE_ACCENT = {
  ports:      { color: '#22d3ee', glow: 'rgba(34,211,238,0.18)'  },
  subdomains: { color: '#a855f7', glow: 'rgba(168,85,247,0.18)'  },
  emails:     { color: '#22d3ee', glow: 'rgba(34,211,238,0.18)'  },
  breach:     { color: '#f97316', glow: 'rgba(249,115,22,0.18)'  },
  social:     { color: '#a855f7', glow: 'rgba(168,85,247,0.18)'  },
  phone:      { color: '#38bdf8', glow: 'rgba(56,189,248,0.18)'  },
};

export default function ModuleDetailModal({ moduleKey, onClose }) {
  if (!moduleKey) return null;
  const mod = moduleDetails[moduleKey];
  const { color, glow } = MODULE_ACCENT[moduleKey] || MODULE_ACCENT.ports;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-black/95 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          border:     `1px solid ${color}28`,
          boxShadow:  `0 0 70px ${glow}, 0 0 0 1px ${color}15`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="px-6 py-4 border-b flex items-start justify-between"
          style={{
            borderColor: `${color}15`,
            background:  `linear-gradient(135deg, ${glow}, transparent)`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl leading-none">{mod.icon}</span>
            <div>
              <h3
                className="text-sm font-extrabold font-mono uppercase tracking-widest"
                style={{ color }}
              >
                {mod.title}
              </h3>
              <p className="text-[10px] text-gray-500 font-mono mt-0.5 leading-snug">
                {mod.summary}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white text-base leading-none transition-colors mt-0.5"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* ── Results list ───────────────────────────────── */}
        <div className="p-5 space-y-3">
          <div
            className="text-[8.5px] font-mono uppercase tracking-[0.2em] mb-1"
            style={{ color: `${color}60` }}
          >
            ── Intelligence Output ─────────────────
          </div>

          <ul className="space-y-1.5">
            {mod.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg px-3.5 py-2.5 font-mono text-[11px] border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] transition-colors"
              >
                <span style={{ color }} className="mt-px shrink-0 leading-none">›</span>
                <span className="text-gray-300 leading-snug">{item}</span>
              </li>
            ))}
          </ul>

          {/* Footer meta */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[8.5px] text-gray-700 font-mono">
              {mod.items.length} record{mod.items.length !== 1 ? 's' : ''} extracted
            </span>
            <span
              className="text-[8px] px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider"
              style={{
                color,
                background: glow,
                border:     `1px solid ${color}30`,
              }}
            >
              ● MOCK DATA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
