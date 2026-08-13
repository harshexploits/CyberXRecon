import { useState } from 'react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      codeName: 'INTELL-01',
      price: '$0',
      period: '',
      desc: 'Essential passive intelligence scans for security students and amateurs.',
      features: [
        '2 target sweeps / month',
        'Subdomain discovery query limits',
        'Basic email address harvesting crawler',
        'Intelligence logs stored for 7 days',
        'Standard Community Forum support',
      ],
      highlight: false,
      cta: 'Initialize Free Node',
      color: 'rgba(34, 211, 238, 0.4)', // cyan border
      bg: 'rgba(34, 211, 238, 0.02)',
      btnClass: 'border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-300 hover:text-white',
    },
    {
      name: 'Pro',
      codeName: 'SPECTRE-02',
      price: isYearly ? '$4' : '$5',
      period: '/mo',
      yearlyBilled: 'Billed $48 annually',
      desc: 'Engineered for active bug hunters, red-team operators, and researchers.',
      features: [
        '50 target sweeps / month',
        'All active & passive OSINT modules',
        'Interactive D3 Force-Directed Network Graph',
        'Radial relationship map & Hierarchical tree panels',
        'Detailed raw JSON logs download support',
        'Intelligence logs stored for 90 days',
        'Priority Cyber Response support ticket response',
      ],
      highlight: true,
      cta: 'Equip Spectre Overlay',
      color: 'rgba(168, 85, 247, 0.8)', // purple accent
      bg: 'rgba(168, 85, 247, 0.04)',
      btnClass: 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98]',
    },
    {
      name: 'Max',
      codeName: 'APEX-03',
      price: isYearly ? '$8' : '$10',
      period: '/mo',
      yearlyBilled: 'Billed $96 annually',
      desc: 'Uncompromised performance for enterprise threat response units.',
      features: [
        '200 target sweeps / month',
        'All Pro modules + High-speed cluster runs',
        'Immersive fullscreen workspace HUD environment',
        'Executive PDF dossier compilation preview',
        'Infinite intelligence logs history',
        'Dedicated response unit email support',
      ],
      highlight: false,
      cta: 'Access Apex Core',
      color: 'rgba(236, 72, 153, 0.6)', // pink accent
      bg: 'rgba(236, 72, 153, 0.02)',
      btnClass: 'border border-purple-500/40 text-purple-300 hover:bg-purple-500/10 hover:border-purple-300 hover:text-white',
    },
  ];

  return (
    <div className="text-white text-center max-w-6xl mx-auto pt-6 md:pt-12 px-4 pb-20 select-none">
      
      {/* ── Title Area ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-[10px] font-mono font-bold text-purple-300 tracking-widest uppercase">
          // Operational Clearance Pricing
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans">
          Deploy OSINT without resource limits
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto text-xs md:text-sm leading-relaxed font-mono">
          Select your operational tier. Upgrade, downgrade, or terminate clearance levels at any time.
        </p>
      </div>

      {/* ── Billing Toggle ────────────────────────────────────── */}
      <div className="flex justify-center items-center gap-4 mt-12 bg-black/40 border border-white/[0.05] p-2.5 rounded-full w-fit mx-auto backdrop-blur-sm">
        <button
          onClick={() => setIsYearly(false)}
          className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-300 ${
            !isYearly ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-gray-500 border border-transparent'
          }`}
        >
          Monthly Cycle
        </button>
        <button
          onClick={() => setIsYearly(true)}
          className={`px-5 py-2 rounded-full text-xs font-mono font-bold tracking-wider transition-all duration-300 flex items-center gap-2 ${
            isYearly ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 border border-transparent'
          }`}
        >
          Annual Cycle
          <span className="text-[8px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/25">Save 20%</span>
        </button>
      </div>

      {/* ── Pricing Matrix ────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              borderColor: plan.color,
              background: `linear-gradient(180deg, ${plan.bg} 0%, rgba(0,0,0,0.85) 100%)`,
              boxShadow: plan.highlight 
                ? `0 0 50px rgba(168, 85, 247, 0.12), inset 0 0 30px ${plan.color}05`
                : `0 0 30px rgba(0,0,0,0.5)`,
            }}
            className={`relative rounded-2xl p-8 text-left border flex flex-col justify-between transition-all duration-500 backdrop-blur-md hover:translate-y-[-4px] group ${
              plan.highlight ? 'scale-105 z-10' : ''
            }`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-600 text-[9px] font-bold font-mono px-4 py-1 rounded-full uppercase tracking-widest shadow-md shadow-cyan-500/20 animate-pulse-glow border border-cyan-400/30">
                ⭐ Recommended Tier
              </span>
            )}
            
            <div>
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono text-gray-500 tracking-wider mb-1">
                    {plan.codeName}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white font-mono uppercase">
                    {plan.name}
                  </h3>
                </div>
                {plan.name === 'Max' && (
                  <span className="text-[8px] font-extrabold font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2.5 py-1 rounded uppercase tracking-wider">
                    Enterprise
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-400 text-xs mt-3.5 leading-relaxed min-h-[36px] font-light">
                {plan.desc}
              </p>

              {/* Pricing Section */}
              <div className="mt-8 flex flex-col min-h-[70px] border-b border-white/[0.05] pb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white font-mono">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-400 mb-1 font-mono text-sm">{plan.period}</span>
                  )}
                </div>
                {isYearly && plan.yearlyBilled && (
                  <span className="text-[9px] text-purple-400 font-mono font-bold uppercase tracking-wider mt-1.5">
                    ● {plan.yearlyBilled}
                  </span>
                )}
              </div>

              {/* Feature List */}
              <ul className="mt-6 space-y-4">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span 
                      style={{ color: plan.color.replace('0.4', '1').replace('0.8', '1').replace('0.6', '1') }} 
                      className="font-bold shrink-0 mt-0.5 text-xs font-mono"
                    >
                      ⬡
                    </span>
                    <span className="text-xs text-gray-300 leading-relaxed font-mono font-light">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            <button
              onClick={() => alert(`Operational mode authorization failed: Demo accounts cannot activate ${plan.name} subscriptions.`)}
              className={`w-full mt-10 py-3.5 rounded-lg font-bold font-mono text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer ${plan.btnClass}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* ── Feature Comparison Note ───────────────────────────── */}
      <div className="mt-20 border border-white/[0.04] bg-black/35 rounded-2xl p-6 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
            // High Density Compliance & Operational Auditing
          </h4>
          <p className="text-[11px] text-gray-500 font-mono mt-1 max-w-2xl leading-normal">
            Need customized target sweeping counts or offline integrations? We build tailored threat matrices for high compliance, private networks, and air-gapped security centers.
          </p>
        </div>
        <button
          onClick={() => alert('Contacting Intel Support module... Redirecting request.')}
          className="px-6 py-2.5 bg-black border border-white/[0.12] rounded-lg text-xs font-mono text-white hover:border-cyan-500/40 hover:text-cyan-400 transition-all whitespace-nowrap cursor-pointer"
        >
          Request Custom Audit
        </button>
      </div>

    </div>
  );
}
