import TerminalTyping from '../components/home/TerminalTyping';
import FeatureCard from '../components/home/FeatureCard';
import StatItem from '../components/home/StatItem';

export default function HomePage({ setCurrentPage }) {
  const features = [
    { icon: '🛰️', title: 'Port Scanning', desc: 'Automated TCP scans surface open ports and running services on any target.' },
    { icon: '🌐', title: 'Subdomain Enum', desc: 'Discovers hidden subdomains across a target\'s attack surface using multiple engines.' },
    { icon: '✉️', title: 'Email Harvesting', desc: 'Pulls associated emails and metadata from certificate transparency and WHOIS records.' },
    { icon: '🕵️', title: 'Social Recon', desc: 'Traces usernames across hundreds of platforms to map comprehensive digital footprints.' },
    { icon: '🔓', title: 'Breach Check', desc: 'Cross-references targets against known massive breach databases to flag compromises.' },
  ];

  const steps = [
    { step: '01', title: 'Enter Target', desc: 'Type any domain, email address, or username into the scan input.' },
    { step: '02', title: 'Automated Run', desc: 'Our engine fires up multiple parallel OSINT modules in safe sandboxes.' },
    { step: '03', title: 'Analyze Intelligence', desc: 'Get a clean, downloadable JSON report or browse an interactive graph map.' },
  ];

  return (
    <div className="max-w-6xl mx-auto text-center pt-8 md:pt-16">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-xs font-semibold text-cyan-400 tracking-wide">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          V1.0.0 Now Live
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight">
          <span className="shimmer-text">CyberXRecon</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-2xl mx-auto">
          Galactic Intelligence OSINT Platform
        </p>
        <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Automated recon across domains, subdomains, emails, and breach data. Consolidate your threat analysis into one beautiful visual workflow.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-10">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start Scanning
        </button>
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="px-8 py-3 border border-gray-700 text-gray-300 rounded-full hover:bg-white/10 hover:border-gray-500 transition-all"
        >
          View Demo Scan
        </button>
      </div>

      <TerminalTyping />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 px-4">
        <StatItem value="6+" label="OSINT Modules" />
        <StatItem value="15s" label="Avg Scan Speed" />
        <StatItem value="12k+" label="Recon Operations" />
        <StatItem value="99.9%" label="Engine Uptime" />
      </div>

      <div className="mt-32">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Advanced Scanning Engines</h2>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm md:text-base">Every major recon technique, orchestrated dynamically in one single click.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-12 px-4">
          {features.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
          <div className="border border-dashed border-white/10 bg-black/20 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-65 min-h-[180px]">
            <div className="text-3xl mb-2 text-cyan-400/50">➕</div>
            <h3 className="text-lg font-semibold text-white/80">More Modules</h3>
            <p className="text-gray-500 text-xs mt-1 max-w-[200px]">Have suggestions? Contact support to request new target transforms.</p>
          </div>
        </div>
      </div>

      <div className="mt-32 relative">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">How It Works</h2>
        <p className="text-gray-400 mt-3 max-w-lg mx-auto text-sm md:text-base">From raw target inputs to structured threat maps in seconds.</p>
        <div className="grid md:grid-cols-3 gap-8 mt-16 px-4 relative">
          {steps.map((s, index) => (
            <div key={s.step} className="relative bg-white/[0.01] border border-white/5 rounded-2xl p-6 text-left group hover:border-cyan-500/20 transition-all duration-300">
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[1px] bg-gradient-to-r from-cyan-400/30 to-purple-600/30 z-10" />
              )}
              <div className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">{s.step}</div>
              <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-32 border border-cyan-500/10 rounded-2xl bg-black/60 backdrop-blur-md p-10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent blur-xl pointer-events-none" />
        <p className="text-gray-300 italic text-base md:text-lg leading-relaxed relative z-10">
          "Built by security analysts for modern red-teams and ethical hackers. Bringing real-world offensive scanning logic out of terminal silos into a responsive visual workspace."
        </p>
        <div className="text-cyan-400 text-xs uppercase tracking-wider font-bold mt-4">— CyberXRecon Engineering</div>
      </div>

      <div className="mt-32 pb-16">
        <h2 className="text-3xl font-extrabold text-white">Scale Your OSINT Operations</h2>
        <p className="text-gray-400 mt-3 max-w-md mx-auto text-sm">Flexible tiers built for students, bug hunters, and security intelligence teams alike.</p>
        <button
          onClick={() => setCurrentPage('pricing')}
          className="mt-8 px-8 py-3 border border-cyan-500/30 text-cyan-400 rounded-full hover:bg-cyan-500/10 hover:border-cyan-400 transition-all font-semibold"
        >
          Explore Pricing &amp; Subscriptions →
        </button>
      </div>
    </div>
  );
}
