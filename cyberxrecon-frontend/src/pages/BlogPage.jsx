import { useState } from 'react';

export default function BlogPage() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const posts = [
    {
      id: 1,
      code: 'LOG-042',
      category: 'ENGINEERING',
      title: 'Building CyberXRecon: From a Local CLI Script to a Galaxy-Themed Platform',
      date: 'August 9, 2026',
      readTime: '6 min read',
      summary: 'An inside look at how individual terminal-based OSINT tools were consolidated into a single visual canvas—and the performance hurdles of rendering 2D force graphs alongside 3D starfields.',
      content: (
        <div className="space-y-6 font-mono text-gray-300 text-xs md:text-sm leading-relaxed">
          <p className="border-l-2 border-cyan-400 pl-4 italic text-cyan-400/90 bg-cyan-950/10 py-2 rounded-r">
            "Most OSINT workflows start the same unglamorous way: a terminal window, a handful of tools that don't talk to each other, and a lot of copy-pasting between them."
          </p>
          <p>
            CyberXRecon started as an attempt to fix that—not by rewriting scan protocols, but by orchestrating existing tools (nmap, sublist3r, theHarvester) into a single visual dashboard. What began as a 1,900-line monolithic script eventually needed to evolve into a decomposed, responsive React architecture.
          </p>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-6">
            // PHASE 1: THE GRAPH CONUNDRUM
          </h4>
          <p>
            Our biggest hurdle was performance. Running a Three.js starfield background alongside D3 force-directed maps like `NetworkGraphPanel` and `RadialPanel` was a heavy GPU load. When the user entered the Dashboard, the canvas would experience high CPU frame drops.
          </p>
          <p>
            To resolve this, we optimized our background loading state to conditionally render the 3D galaxy canvas only during marketing/landing pages, and fully unmount it inside the dashboard to preserve memory.
          </p>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-6">
            // PHASE 2: EVENT-BASED COMMUNICATION
          </h4>
          <p>
            Decoupling component updates became critical. Rather than passing state callbacks down multiple React layers and causing massive re-renders, we integrated standard CustomEvents (`cyberxrecon-focus`) to broadcast coordinates and target references directly to node graphs, providing real-time zoom tracking.
          </p>
        </div>
      ),
      status: 'DECLASSIFIED',
    },
    {
      id: 2,
      code: 'LOG-039',
      category: 'METHODOLOGY',
      title: 'Subdomain Enumeration: Passive DNS Harvests vs Active Brute Sweeps',
      date: 'July 28, 2026',
      readTime: '4 min read',
      summary: 'Why passive certificate transparency scrapes often yield better, stealthier targets than hammering DNS servers directly with wordlist brute forcing.',
      content: (
        <div className="space-y-6 font-mono text-gray-300 text-xs md:text-sm leading-relaxed">
          <p className="border-l-2 border-purple-400 pl-4 italic text-purple-400/90 bg-purple-950/10 py-2 rounded-r">
            "Noise is the enemy of recon. Active brute forcing leaves heavy footprints in DNS server logs. Passive harvesting remains completely invisible."
          </p>
          <p>
            When conducting initial target scoping, speed and stealth are paramount. Standard DNS enumeration often relies on brute-forcing wordlists of 10,000+ entries. While useful, this technique fires a barrage of UDP packets directly at local DNS servers, lighting up defensive firewalls.
          </p>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-6">
            // THE Certificate Transparency (CT) ADVANTAGE
          </h4>
          <p>
            By querying public Certificate Transparency logs (like crt.sh or Google CT directories), we can extract registered TLS/SSL certificates for subdomains that have already been issued. This approach requires zero target interaction, meaning we can map out internal subdomains without sending a single packet to the target.
          </p>
        </div>
      ),
      status: 'SECURED',
    },
    {
      id: 3,
      code: 'LOG-031',
      category: 'OSINT BASICS',
      title: 'De-anonymizing Target Lists via Public Breach Cross-References',
      date: 'June 15, 2026',
      readTime: '5 min read',
      summary: 'An exploration of how threat analysts stitch together corporate emails found in public domain registries to check credentials exposures against historic archives.',
      content: (
        <div className="space-y-6 font-mono text-gray-300 text-xs md:text-sm leading-relaxed">
          <p className="border-l-2 border-pink-400 pl-4 italic text-pink-400/90 bg-pink-950/10 py-2 rounded-r">
            "Finding an email is only the first step. Tracing whether that identity has historic exposure records is where the threat model gains teeth."
          </p>
          <p>
            Security targets often assume their digital perimeter is secure if their firewalls reject port scans. However, user identities are the weakest link. By matching harvested target domain emails with historic breaches (like Collection #1 or Exploit.in), we pinpoint vulnerability profiles before scanning network nodes.
          </p>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mt-6">
            // CREDENTIAL INTERSECT CHECKING
          </h4>
          <p>
            In CyberXRecon, breach cross-referencing maps exposed usernames to known database dumps. This guides developers and administrators to quickly enforce password rotations and multi-factor authentication policies.
          </p>
        </div>
      ),
      status: 'SECURED',
    },
  ];

  const filteredPosts = filter === 'ALL' 
    ? posts 
    : posts.filter(p => p.category === filter);

  return (
    <div className="text-white text-center max-w-5xl mx-auto pt-6 md:pt-12 px-4 pb-20 select-none">
      
      {/* ── Title Area ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/5 text-[10px] font-mono font-bold text-purple-300 tracking-widest uppercase">
          // Declassified Intel Logs
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-sans">
          Threat Intelligence Archive
        </h2>
        <p className="text-gray-400 max-w-lg mx-auto text-xs md:text-sm leading-relaxed font-mono">
          Operational blueprints, design timelines, and core OSINT methodology logs.
        </p>
      </div>

      {/* ── Filter Tabs ───────────────────────────────────────── */}
      {!selectedPost && (
        <div className="flex flex-wrap justify-center items-center gap-3 mt-10 border-b border-white/[0.05] pb-5">
          {['ALL', 'ENGINEERING', 'METHODOLOGY', 'OSINT BASICS'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                filter === cat
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                  : 'text-gray-500 border border-transparent hover:text-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Grid/List View ────────────────────────────────────── */}
      {!selectedPost ? (
        <div className="max-w-3xl mx-auto mt-12 space-y-6">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="w-full text-left border border-white/[0.06] bg-black/70 hover:border-cyan-500/40 hover:bg-black/90 rounded-2xl p-6 transition-all duration-300 relative cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)] group overflow-hidden"
            >
              {/* Highlight gradient bar */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-800/30 px-2.5 py-1 rounded uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {post.code} // {post.status}
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold font-sans text-white mt-4 group-hover:text-cyan-400 transition-colors">
                {post.title}
              </h3>
              
              <p className="text-gray-500 text-xs font-mono mt-2">
                {post.date} · {post.readTime}
              </p>
              
              <p className="text-gray-400 text-xs font-mono mt-3 leading-relaxed font-light">
                {post.summary}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-4">
                <span className="text-cyan-400 text-xs font-mono font-bold tracking-wider group-hover:text-cyan-300 transition-colors">
                  READ LOG ENTRIES ›
                </span>
                <span className="text-[9px] text-gray-600 font-mono">
                  CLEARANCE: PUBLIC
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── Single Article View ────────────────────────────── */
        <article className="max-w-3xl mx-auto mt-12 text-left border border-cyan-500/25 bg-black/90 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.06)]">
          {/* Back button */}
          <button
            onClick={() => setSelectedPost(null)}
            className="px-4 py-2 border border-white/[0.08] text-gray-400 rounded-lg text-xs font-mono hover:border-cyan-500/30 hover:text-cyan-400 transition-all cursor-pointer mb-8"
          >
            ← RETURN TO LOG ARCHIVE
          </button>

          {/* Article Header info */}
          <div className="flex items-center justify-between border-b border-white/[0.05] pb-4 mb-6">
            <div>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/20 border border-purple-800/30 px-2 py-0.5 rounded uppercase tracking-wider">
                {selectedPost.category}
              </span>
              <span className="text-xs text-gray-500 font-mono ml-3">
                {selectedPost.date} · {selectedPost.readTime}
              </span>
            </div>
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">
              ID: {selectedPost.code} / {selectedPost.status}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight font-sans">
            {selectedPost.title}
          </h1>

          {/* Article Content */}
          <div className="mt-8">
            {selectedPost.content}
          </div>

          {/* Declassification signature */}
          <div className="mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.01] p-4 rounded-xl">
            <div>
              <span className="text-[8.5px] text-gray-600 font-mono uppercase tracking-widest block">
                INTELLIGENCE ORIGIN
              </span>
              <span className="text-xs text-cyan-400 font-mono font-bold">
                CYBERXRECON CORE TEAM LOGS
              </span>
            </div>
            <div className="text-right">
              <span className="text-[8.5px] text-gray-600 font-mono uppercase tracking-widest block">
                AUDIT VERIFIED
              </span>
              <span className="text-xs text-green-400 font-mono font-bold uppercase">
                ● STATUS: DECLASSIFIED SECURE
              </span>
            </div>
          </div>
        </article>
      )}

    </div>
  );
}
