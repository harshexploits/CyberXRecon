import { useMemo } from 'react';

export default function OverviewPanel({ data }) {
  // Safe extracts with fallback values to feed the hook safely
  const modules = data?.modules || [];
  const totalFindings = data?.totalFindings || 0;
  const target = data?.target || '';

  // --- HOOK MOVED TO TOP (Always runs on every render, 100% React compliant) ---
  const { score, riskLabel, riskColor, grade } = useMemo(() => {
    const normalized = Math.min(100, Math.max(10, totalFindings * 4));
    let label = 'LOW';
    let color = '#10b981'; // Green
    let letterGrade = 'A';

    if (normalized >= 75) {
      label = 'CRITICAL';
      color = '#ef4444'; // Red
      letterGrade = 'F';
    } else if (normalized >= 50) {
      label = 'MEDIUM';
      color = '#f59e0b'; // Amber
      letterGrade = 'C';
    } else if (normalized >= 25) {
      label = 'LOW';
      color = '#eab308'; // Yellow
      letterGrade = 'B-';
    }

    return { score: normalized, riskLabel: label, riskColor: color, grade: letterGrade };
  }, [totalFindings]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (score / 100) * circumference;

  // --- ABSOLUTE SAFETY GUARD MOVED TO BOTTOM (Safe rendering bypass) ---
  if (!data) {
    return (
      <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0 items-center justify-center font-mono text-[10px] text-gray-500">
        Loading Diagnostic data...
      </div>
    );
  }

  return (
    <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
      
      {/* Panel Header */}
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0 bg-black/30">
        <span className="text-cyan-400">📊</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Target Exposure Diagnostic</h3>
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto min-h-0 space-y-4">
        
        {/* Core HUD Indicators Row */}
        <div className="grid grid-cols-3 gap-3">
          
          {/* Circular Threat Gauge */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center relative">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32" cy="32" r={radius}
                className="stroke-gray-800"
                strokeWidth="4"
                fill="transparent"
              />
              <circle
                cx="32" cy="32" r={radius}
                stroke={riskColor}
                strokeWidth="4.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                className="transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center mt-[-4px]">
              <span className="text-xs font-mono font-bold text-white block leading-none">{score}%</span>
              <span className="text-[6px] text-gray-500 uppercase tracking-widest block mt-0.5">Exposure</span>
            </div>
          </div>

          {/* Letter Grade */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-1">Security Rating</span>
            <span className="text-xl font-bold leading-none font-mono tracking-tighter" style={{ color: riskColor }}>
              GRADE {grade}
            </span>
          </div>

          {/* Total Findings Counter */}
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-[8px] text-gray-500 uppercase tracking-wider block mb-1">Exposure Nodes</span>
            <span className="text-xl font-mono font-bold text-white leading-none">
              {totalFindings}
            </span>
          </div>

        </div>

        {/* Diagnostic breakdown bar graphs */}
        <div className="space-y-2.5">
          <span className="text-[9px] text-gray-500 font-bold tracking-wider block uppercase">
            // Module Coverage Statistics
          </span>
          <div className="space-y-2">
            {modules.map((m) => {
              if (!m) return null;
              const count = m.items ? m.items.length : 0;
              const barWidth = Math.min(100, Math.max(8, (count / 8) * 100));

              return (
                <div key={m.key} className="space-y-1">
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-gray-400 font-semibold">{m.icon} {m.title}</span>
                    <span className="text-gray-500 font-bold">{count} items detected</span>
                  </div>
                  {/* Custom progress background */}
                  <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: m.color || '#22d3ee', 
                        width: `${barWidth}%` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}