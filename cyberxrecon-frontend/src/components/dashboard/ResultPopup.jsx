const cornerClasses = {
  ports: 'fixed top-28 left-6 md:left-10',
  subdomains: 'fixed top-28 right-6 md:right-10',
  phone: 'fixed top-[46%] left-4 md:left-8',
  social: 'fixed top-[46%] right-4 md:right-8',
  emails: 'fixed bottom-24 left-6 md:left-10',
  breach: 'fixed bottom-24 right-6 md:right-10',
};

const entranceOffset = {
  ports: 'translate(-140px, -100px) scale(0.3)',
  subdomains: 'translate(140px, -100px) scale(0.3)',
  phone: 'translate(-160px, 0px) scale(0.3)',
  social: 'translate(160px, 0px) scale(0.3)',
  emails: 'translate(-140px, 100px) scale(0.3)',
  breach: 'translate(140px, 100px) scale(0.3)',
};

export default function ResultPopup({ corner, icon, title, items, stage, mergeTransform, registerRef, onOpen }) {
  let transform = entranceOffset[corner];
  let opacity = 0;

  if (stage === 'visible') {
    transform = 'translate(0, 0) scale(1)';
    opacity = 1;
  } else if (stage === 'merging') {
    transform = mergeTransform || 'scale(0)';
    opacity = 0;
  }

  return (
    <div
      ref={(el) => registerRef(corner, el)}
      className={`${cornerClasses[corner]} z-40 w-56 ${stage === 'visible' ? 'pointer-events-auto cursor-pointer' : 'pointer-events-none'}`}
      style={{
        transform,
        opacity,
        transition: 'transform 1s cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease',
      }}
      onClick={() => stage === 'visible' && onOpen(corner)}
    >
      <div className={`border border-cyan-500/40 bg-black/75 backdrop-blur-md rounded-xl p-4 shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:border-cyan-400/70 hover:shadow-[0_0_35px_rgba(34,211,238,0.35)] transition-shadow ${stage === 'visible' ? 'animate-float' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{icon}</span>
          <h4 className="text-sm font-semibold text-cyan-400">{title}</h4>
        </div>
        <ul className="space-y-1 text-xs text-gray-300 font-mono">
          {items.map((item) => (
            <li key={item}>› {item}</li>
          ))}
        </ul>
        {stage === 'visible' && (
          <p className="text-[10px] text-cyan-500/60 mt-2">Click for details</p>
        )}
      </div>
    </div>
  );
}
