import { useState } from 'react';

export default function SupportPage() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { 
      icon: '🛰️', 
      title: 'Getting Started', 
      desc: 'Setting up target configurations, workspace modes, and your first passive engine sweep.',
      accent: 'border-cyan-500/30 hover:border-cyan-400 text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] bg-cyan-950/[0.04]'
    },
    { 
      icon: '📊', 
      title: 'Scans & Reports', 
      desc: 'Decoding Nmap, Sherlock, subdomains maps, intelligence downloads, and report signatures.',
      accent: 'border-purple-500/30 hover:border-purple-400 text-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-950/[0.04]'
    },
    { 
      icon: '💳', 
      title: 'Billing & Plans', 
      desc: 'Managing tier clearances, stripe transactions, invoices, and active operator updates.',
      accent: 'border-amber-500/30 hover:border-amber-400 text-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-amber-950/[0.04]'
    },
    { 
      icon: '🔑', 
      title: 'Security & API', 
      desc: 'Establishing secure operator tokens, user credentials, and developer API integrations.',
      accent: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-950/[0.04]'
    },
  ];

  const faqs = [
    {
      q: 'How do I run my first passive targets scan?',
      a: 'Navigate to the Dashboard console. Insert the target domain, IP, or online alias into the prime node deck. Press ENGAGE ENGINE to initialize automatic active sweeps. Results compile dynamically as individual scanning modules finish their routines.',
    },
    {
      q: 'Is scanning legal on any external target address?',
      a: 'No. CyberXRecon is strictly built for certified red-team testing, authorised penetration check routines, and validated bug bounty targets. Scans should only target domains for which you possess signed authorization documents. Running OSINT sweeps without clearance is prohibited under terms.',
    },
    {
      q: 'What distinguishes the Free, Pro, and Max plans?',
      a: 'Free offers 2 scans/month and basic subdomain indexing. Pro expands capacity to 50 target scans, unlocks deep ports checking, Sherlock tracking, and grants access to the Pro interactive D3 Graph canvas. Max tier opens developer API lines, zero-queue sweeps, and 200 scans.',
    },
    {
      q: 'How can I save target outputs locally?',
      a: 'Once a target sweep completes, action lines will appear beneath the CRT console. Select ↓ JSON to save raw scanner tables, or select Copy Report to copy the formatted output stream directly onto your system clipboard.',
    },
    {
      q: 'Do you offer direct API query access?',
      a: 'API keys are currently available under developer preview within the Max tier. Once authorized, API tokens are managed from the operator panel settings and support up to 50 concurrent query lines.',
    },
    {
      q: 'How do I cancel or alter my clearance tier?',
      a: ' Clearance changes can be adjusted instantly in Settings > Billing. Upgrades, downgrades, or clearance cancellations take effect immediately at the end of the current cycle.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-white text-center max-w-5xl mx-auto pt-6 md:pt-12 px-4 pb-20 select-none">
      
      {/* ── Title Area ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-[10px] font-mono font-bold text-cyan-300 tracking-widest uppercase">
          // Operator Assistance Console
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans">
          Support &amp; Intelligence Hub
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto text-xs md:text-sm leading-relaxed font-mono">
          Acquire guidebooks, query FAQ indexes, or contact a cyber response officer.
        </p>
      </div>

      {/* ── Cyber Search Bar ──────────────────────────────────── */}
      <div className="max-w-xl mx-auto mt-10 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-cyan-400/40 font-mono text-sm">
          QUERY ›
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter database indexes, FAQ keywords, topics..."
          className="w-full pl-20 pr-5 py-4 rounded-xl bg-black/85 border border-cyan-500/25 text-gray-200 placeholder-gray-600 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/25 transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.04)]"
        />
      </div>

      {/* ── Categories Grid ───────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mt-16">
        {categories.map((c) => (
          <div
            key={c.title}
            onClick={() => alert(`Opening documentation index: ${c.title}`)}
            className={`group border rounded-2xl p-5 transition-all duration-300 text-left cursor-pointer overflow-hidden relative ${c.accent}`}
          >
            <div className="text-3xl mb-3.5 transform group-hover:scale-110 group-hover:translate-x-1.5 transition-transform duration-300 inline-block">
              {c.icon}
            </div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white group-hover:text-white transition-colors duration-200">
              {c.title}
            </h3>
            <p className="text-gray-500 text-[11px] font-mono mt-2 leading-relaxed">
              {c.desc}
            </p>
            {/* Absolute corner decoration */}
            <span className="absolute bottom-2 right-3 text-[10px] text-white/5 font-mono group-hover:text-white/10 transition-colors">
              // RECON
            </span>
          </div>
        ))}
      </div>

      {/* ── Collapsible FAQ List ──────────────────────────────── */}
      <div className="max-w-3xl mx-auto mt-24 text-left">
        <h3 className="text-xl font-bold font-mono text-center mb-8 uppercase tracking-widest text-cyan-400/60">
          ── Frequently Questioned Logs ──
        </h3>

        {filteredFaqs.length === 0 && (
          <p className="text-gray-500 text-center font-mono py-12 border border-dashed border-white/5 rounded-2xl bg-black/20">
            [SYS ERROR]   No database index matched search queries: "{search}"
          </p>
        )}

        <div className="space-y-4">
          {filteredFaqs.map((faq, i) => (
            <div
              key={faq.q}
              className={`border rounded-xl bg-black/75 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
                openIndex === i ? 'border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.06)]' : 'border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4.5 text-left text-gray-200 hover:bg-white/[0.02] transition-all duration-200 font-mono"
              >
                <span className="text-xs md:text-sm text-gray-200 font-bold leading-normal">
                  <span className="text-cyan-500/50 mr-2">[Q-{String(i + 1).padStart(2, '0')}]</span>
                  {faq.q}
                </span>
                <span 
                  className={`transition-transform duration-300 shrink-0 text-cyan-400 text-xl font-mono leading-none ${
                    openIndex === i ? 'rotate-45 text-purple-400' : ''
                  }`}
                >
                  ＋
                </span>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400 text-xs md:text-[13px] leading-relaxed border-t border-white/[0.05] pt-3.5 font-mono font-light">
                  <span className="text-purple-400/60 font-bold mr-2">ANS ›</span>
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Transmitter Pod (Contact Footer) ──────────────────── */}
      <div className="mt-24 border border-cyan-500/20 rounded-2xl bg-black/85 backdrop-blur-md p-10 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
        {/* Radar concentric line graphic decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl pointer-events-none" />
        
        <h3 className="text-lg font-bold font-mono uppercase tracking-widest text-cyan-300">
          📡 Establish Secured Line
        </h3>
        <p className="text-gray-400 text-xs font-mono mt-2 leading-relaxed">
          Request private consultation logs or raise immediate incident sweeps from our cyber intelligence response unit.
        </p>
        
        <button 
          onClick={() => alert('Secure channel transmission complete: Ticket logged.')}
          className="mt-6 px-8 py-3.5 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold font-mono text-xs uppercase tracking-widest rounded-lg hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          Transmit Support Request
        </button>
      </div>

    </div>
  );
}
