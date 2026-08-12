import { moduleDetails } from '../../data/moduleData';

export default function ModuleDetailModal({ moduleKey, onClose }) {
  if (!moduleKey) return null;
  const mod = moduleDetails[moduleKey];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-black/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{mod.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">{mod.title}</h3>
              <p className="text-xs text-gray-500">{mod.summary}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-gray-300 font-mono border-t border-white/10 pt-4">
          {mod.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-cyan-400">›</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
