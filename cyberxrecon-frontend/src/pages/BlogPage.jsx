import { useState } from 'react';

export default function BlogPage() {
  const [openPost, setOpenPost] = useState(false);

  return (
    <div className="text-white">
      <div className="text-center">
        <h2 className="text-4xl font-bold">Intel Blog</h2>
        <p className="text-gray-400 mt-2">Notes on building CyberXRecon, and recon methodology.</p>
      </div>

      {!openPost ? (
        <div className="max-w-2xl mx-auto mt-10 space-y-6">
          <button
            onClick={() => setOpenPost(true)}
            className="w-full text-left border border-cyan-500/30 bg-black/40 rounded-2xl p-6 hover:border-cyan-400/60 hover:bg-black/60 transition-all"
          >
            <span className="text-xs px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold">FEATURED</span>
            <h3 className="text-2xl font-bold text-white mt-3">
              Building CyberXRecon: From a Local Script to a Galaxy-Themed Recon Platform
            </h3>
            <p className="text-gray-500 text-sm mt-2">August 9, 2026 · 6 min read</p>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              How a set of individual OSINT tools running on a local machine turned into a single dashboard —
              and what it took to get the automated recon workflow to actually feel usable.
            </p>
            <span className="text-cyan-400 text-sm font-medium mt-4 inline-block">Read full post →</span>
          </button>

          {[
            { title: 'Subdomain Enumeration: What Actually Finds Results', tag: 'Methodology' },
            { title: 'Reading a Breach Database Match Correctly', tag: 'OSINT Basics' },
          ].map((p) => (
            <div
              key={p.title}
              className="border border-white/10 bg-black/20 rounded-2xl p-6 opacity-60"
            >
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-400 font-semibold">{p.tag}</span>
              <h3 className="text-lg font-semibold text-gray-300 mt-3">{p.title}</h3>
              <p className="text-gray-600 text-sm mt-2">Coming soon.</p>
            </div>
          ))}
        </div>
      ) : (
        <article className="max-w-2xl mx-auto mt-10 text-left">
          <button
            onClick={() => setOpenPost(false)}
            className="text-sm text-cyan-400 hover:underline mb-6"
          >
            ← Back to all posts
          </button>

          <p className="text-gray-500 text-sm">August 9, 2026 · 6 min read</p>
          <h1 className="text-3xl font-bold text-white mt-2 leading-tight">
            Building CyberXRecon: From a Local Script to a Galaxy-Themed Recon Platform
          </h1>

          <div className="mt-8 space-y-5 text-gray-300 leading-relaxed">
            <p>
              Most OSINT workflows start the same unglamorous way: a terminal window, a handful of tools that don't
              talk to each other, and a lot of copy-pasting between them. Run a port scan here, enumerate subdomains
              there, harvest a few emails somewhere else, then manually stitch the findings into something a client
              or a report can actually read. CyberXRecon started as an attempt to fix that — not by building new
              recon techniques, but by giving the existing ones a single home.
            </p>
          </div>
        </article>
      )}
    </div>
  );
}
