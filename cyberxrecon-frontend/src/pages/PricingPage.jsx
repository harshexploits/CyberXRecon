import { useState } from 'react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      desc: 'Essential scans for security students and novices.',
      features: [
        '2 full target scans / month',
        'Subdomain discovery only',
        'Basic email address crawler',
        'Recon logs stored for 7 days',
        'Community Forum support',
      ],
      highlight: false,
      cta: 'Get Started',
    },
    {
      name: 'Pro',
      price: isYearly ? '$4' : '$5',
      period: '/mo',
      yearlyBilled: 'Billed $48 annually',
      desc: 'Perfect for active bug hunters and researchers.',
      features: [
        '50 full target scans / month',
        'All active & passive OSINT modules',
        'CyberXRecon Cluster Graph Workspace',
        'Breach database vulnerability checks',
        'Detailed PDF & raw JSON downloads',
        'Recon logs stored for 90 days',
        'Prioritized Support Ticket responses',
      ],
      highlight: true,
      cta: 'Upgrade to Pro',
    },
    {
      name: 'Max',
      price: isYearly ? '$8' : '$10',
      period: '/mo',
      yearlyBilled: 'Billed $96 annually',
      desc: 'Designed for professional intelligence operations.',
      features: [
        '200 full target scans / month',
        'All Pro modules + High-speed execution',
        'Zero-wait scans (Exclusive queue)',
        'Infinite log storage history',
        'Dedicated account manager support',
        'Full CyberXRecon API access (Beta)',
      ],
      highlight: false,
      cta: 'Upgrade to Max',
    },
  ];

  return (
    <div className="text-white text-center max-w-6xl mx-auto pt-8 md:pt-12 px-4">
      <h2 className="text-4xl font-extrabold tracking-tight">Simple, Transparent Pricing</h2>
      <p className="text-gray-400 mt-2 max-w-md mx-auto text-sm md:text-base">
        Deploy OSINT scans without resource limits. Cancel or switch tiers at any time.
      </p>

      <div className="flex justify-center items-center gap-4 mt-10">
        <span className={`text-sm font-semibold transition-colors duration-200 ${!isYearly ? 'text-cyan-400' : 'text-gray-500'}`}>Monthly</span>
        <button
          onClick={() => setIsYearly(!isYearly)}
          className="relative w-14 h-8 bg-white/[0.06] border border-white/10 rounded-full p-1 transition-colors duration-300 focus:outline-none hover:border-cyan-500/40"
          aria-label="Toggle pricing period"
        >
          <div
            className={`w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 shadow-md transform transition-transform duration-300 ${
              isYearly ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </button>
        <span className={`text-sm font-semibold transition-colors duration-200 flex items-center gap-1.5 ${isYearly ? 'text-cyan-400' : 'text-gray-500'}`}>
          Yearly
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/10">Save 20%</span>
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-3xl p-8 text-left border flex flex-col justify-between transition-all duration-500 ${
              plan.highlight
                ? 'border-cyan-400/80 bg-black/75 shadow-[0_0_40px_rgba(34,211,238,0.15)] scale-105 z-10'
                : 'border-white/10 bg-black/45 hover:border-white/20'
            } backdrop-blur-md`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-purple-600 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-md shadow-cyan-500/20 animate-pulse-glow">
                Most Popular
              </span>
            )}
            <div>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight text-white">{plan.name}</h3>
                {plan.name === 'Max' && (
                  <span className="text-[9px] font-extrabold text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Enterprise</span>
                )}
              </div>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed min-h-[32px]">{plan.desc}</p>
              <div className="mt-6 flex flex-col min-h-[64px]">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-white transition-all duration-300">{plan.price}</span>
                  {plan.period && <span className="text-gray-400 mb-1 font-medium">{plan.period}</span>}
                </div>
                {isYearly && plan.yearlyBilled && (
                  <span className="text-[10px] text-purple-400 font-semibold mt-1">{plan.yearlyBilled}</span>
                )}
              </div>
              <ul className="mt-8 space-y-3.5 text-sm text-gray-300 border-t border-white/5 pt-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-cyan-400 font-bold shrink-0 mt-0.5">✓</span>
                    <span className="text-xs text-gray-300 font-light leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className={`w-full mt-10 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99]'
                  : 'border border-gray-700 text-gray-200 hover:bg-white/10 hover:border-gray-500'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
