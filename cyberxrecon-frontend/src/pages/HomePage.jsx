import { useState, useEffect, useRef } from 'react';

// ── Feature cards data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: '🛰️',
    title: 'Port Scanning',
    desc: 'Automated TCP sweeps across all common service ports to surface exposed listeners and running services on any target.',
    accent: 'cyan',
  },
  {
    icon: '🌐',
    title: 'Subdomain Discovery',
    desc: 'Queries multiple DNS zones and certificate transparency logs simultaneously, mapping every hidden subdomain in seconds.',
    accent: 'purple',
  },
  {
    icon: '✉️',
    title: 'Email Harvesting',
    desc: 'Extracts associated emails and domain metadata from WHOIS records, CT logs, and public registry databases.',
    accent: 'cyan',
  },
  {
    icon: '🕵️',
    title: 'Social Footprinting',
    desc: 'Traces a specific username across hundreds of social platforms to resolve a comprehensive digital identity map.',
    accent: 'purple',
  },
  {
    icon: '🔓',
    title: 'Breach Correlation',
    desc: 'Cross-references target domains and emails against known massive credential leaks to flag compromised assets.',
    accent: 'cyan',
  },
  {
    icon: '📱',
    title: 'Phone Metadata',
    desc: 'Resolves carrier details, line types, and geographical metadata for discovered phone numbers.',
    accent: 'purple',
  },
];

const STEPS = [
  { num: '01', title: 'Create Your Account', desc: 'Sign up in seconds and gain access to the CyberXRecon operator platform.' },
  { num: '02', title: 'Enter Your Target', desc: 'Type in any domain, IP address, username, or email to initialise a recon sweep.' },
  { num: '03', title: 'Analyse Intelligence', desc: 'Browse an interactive graph map or export a clean JSON report of your findings.' },
];

const STATS = [
  { value: '6+',    label: 'OSINT Modules' },
  { value: '15s',   label: 'Avg Scan Time' },
  { value: '99.9%', label: 'Engine Uptime' },
  { value: '100%',  label: 'Passive Only' },
];

// ── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal-hidden').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Animated ticker strip ──────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '🛰️ Port Scanning', '🌐 Subdomain Recon', '✉️ Email Harvest', '🔓 Breach Lookup',
  '🕵️ Social OSINT', '📱 Phone Metadata', '⚡ Passive Only', '🧠 AI-Assisted',
];

export default function HomePage({ setCurrentPage }) {
  useReveal();

  return (
    <div className="max-w-7xl mx-auto select-none">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center pt-8 md:pt-16 pb-20 space-y-8">

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-[10px] font-mono font-bold text-cyan-400 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          V1.0 · Platform Now Live
        </div>

        {/* Main heading */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none select-text">
          <span className="shimmer-text">CyberXRecon</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 font-mono tracking-widest uppercase max-w-2xl leading-relaxed">
          Autonomous Threat Intelligence Platform
        </p>

        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Execute multi-threaded OSINT sweeps across ports, subdomains, emails, and breach networks.
          Consolidate your entire attack surface analysis into one visual workspace in seconds.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <button
            id="home-get-started"
            onClick={() => setCurrentPage('auth')}
            className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full text-sm tracking-wider hover:shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
            Get Started Free
          </button>
          <button
            id="home-view-dashboard"
            onClick={() => setCurrentPage('dashboard')}
            className="px-8 py-4 border border-white/15 text-gray-300 font-bold rounded-full text-sm tracking-wider hover:bg-white/5 hover:border-white/30 hover:text-white transition-all"
          >
            View Live Demo
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 w-full max-w-2xl">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-black bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent">{s.value}</div>
              <div className="text-gray-500 text-[10px] font-mono uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TICKER STRIP ─────────────────────────────────────────────────────── */}
      <div className="relative border-y border-white/5 py-3 mb-24 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em] shrink-0">
              {item}
            </span>
          ))}
        </div>
        {/* fade edges */}
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="mb-32">
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Six Scanning Engines. <span className="shimmer-text">One Platform.</span>
          </h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Every major passive recon technique orchestrated in a single click.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`reveal-hidden group relative border rounded-2xl p-6 transition-all duration-300 overflow-hidden cursor-default
                ${f.accent === 'cyan'
                  ? 'border-cyan-500/15 bg-black/50 backdrop-blur-md hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.08)]'
                  : 'border-purple-500/15 bg-black/50 backdrop-blur-md hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.08)]'
                }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 w-full h-[2px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left
                ${f.accent === 'cyan' ? 'bg-gradient-to-r from-cyan-400 to-transparent' : 'bg-gradient-to-r from-purple-400 to-transparent'}`} />

              <div className="text-3xl mb-4 transform group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300 inline-block">
                {f.icon}
              </div>
              <h3 className={`text-base font-bold mb-2 group-hover:transition-colors duration-200
                ${f.accent === 'cyan' ? 'text-white group-hover:text-cyan-400' : 'text-white group-hover:text-purple-400'}`}>
                {f.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="mb-32">
        <div className="text-center mb-16 reveal-hidden">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How It Works</h2>
          <p className="text-gray-400 mt-4 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            From raw target input to structured threat maps in under 15 seconds.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-cyan-400/30 via-purple-500/30 to-cyan-400/30" />

          {STEPS.map((s, idx) => (
            <div key={s.num} className="reveal-hidden relative bg-black/40 border border-white/[0.06] rounded-2xl p-8 text-left group hover:border-cyan-500/20 transition-all duration-300">
              <div className="text-5xl font-black bg-gradient-to-br from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4 leading-none">
                {s.num}
              </div>
              <h3 className="text-lg font-bold text-white mb-3">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="reveal-hidden mb-24">
        <div className="relative border border-cyan-500/15 rounded-3xl bg-black/60 backdrop-blur-md p-12 md:p-20 text-center overflow-hidden">
          {/* Background glow blobs */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
              Ready to Start Scanning?
            </h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm md:text-base leading-relaxed mb-10">
              Create your free account and run your first reconnaissance sweep in under 60 seconds.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                id="home-cta-signup"
                onClick={() => setCurrentPage('auth')}
                className="group relative px-10 py-4 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-extrabold rounded-full text-sm tracking-wider hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                Create Free Account →
              </button>
              <button
                id="home-cta-pricing"
                onClick={() => setCurrentPage('pricing')}
                className="px-10 py-4 border border-purple-500/40 text-purple-300 font-bold rounded-full text-sm tracking-wider hover:bg-purple-950/20 hover:border-purple-400 hover:text-white transition-all"
              >
                Explore Pricing Plans
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
