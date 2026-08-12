import { useState } from 'react';

export default function SupportPage() {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState(null);

  const categories = [
    { icon: '🚀', title: 'Getting Started', desc: 'Setting up your first target scan and configuration.' },
    { icon: '🔍', title: 'Scans & Reports', desc: 'Analyzing results, logs, and exporting reports.' },
    { icon: '💳', title: 'Billing & Plans', desc: 'Managing pricing plans, invoices, and Stripe billing.' },
    { icon: '🔐', title: 'Security & API', desc: 'Setting up secure tokens, user authentication, and API keys.' },
  ];

  const faqs = [
    {
      q: 'How do I run my first scan?',
      a: 'Go to the Dashboard, enter a domain, email, or username as your target, and click "Run Scan". Results appear in your dashboard once the automated engines complete.',
    },
    {
      q: 'Is it legal to scan any target I want?',
      a: 'No. CyberXRecon is strictly for authorized security auditing, bug bounty research, and threat modeling. You must have explicit written consent from the owner. Scanning target infrastructures without authorization violates security terms.',
    },
    {
      q: 'What’s the difference between Free, Pro, and Max plans?',
      a: 'Free offers 2 scans/month and subdomain enum. Pro expands to 50 scans/month, unlocks active ports/Sherlock modules, and displays results in our interactive network map. Max adds API keys, high priority queue lanes, and 200 scans/month.',
    },
    {
      q: 'How do I export a scan report?',
      a: 'Open any successfully completed scan in the Dashboard page and select "Download JSON" or "Copy Report" to store findings locally. PDF downloads are coming soon.',
    },
    {
      q: 'Do you offer API access?',
      a: 'API access keys are bundled with the Max tier plan. We are currently rolling out developer beta keys. You can apply in the dashboard settings once registered.',
    },
    {
      q: 'How do I cancel or change my plan?',
      a: 'Go to Settings > Billing within your CyberXRecon portal. You can upgrade, downgrade, or cancel your active subscription with a single click.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-white text-center max-w-5xl mx-auto pt-8 md:pt-12 px-4">
      <h2 className="text-4xl font-extrabold tracking-tight">Support &amp; Docs Hub</h2>
      <p className="text-gray-400 mt-2 text-sm md:text-base">
        Browse helpful resources, guidebooks, and answer common platform questions.
      </p>

      <div className="max-w-xl mx-auto mt-8 relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500">🔍</div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documentation, topics, FAQs..."
          className="w-full pl-12 pr-5 py-3.5 rounded-full bg-black/60 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all duration-300"
        />
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {categories.map((c) => (
          <div
            key={c.title}
            className="group border border-white/10 bg-black/40 rounded-2xl p-5 hover:border-cyan-500/40 hover:bg-black/60 transition-all duration-300 text-left cursor-pointer overflow-hidden relative"
          >
            <div className="text-3xl mb-3 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 inline-block">{c.icon}</div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-200">{c.title}</h3>
            <p className="text-gray-500 text-xs mt-2 leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-20 text-left">
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        {filteredFaqs.length === 0 && (
          <p className="text-gray-500 text-center font-mono py-12">No FAQ items matched: "{search}"</p>
        )}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq, i) => (
            <div
              key={faq.q}
              className="border border-white/10 rounded-2xl bg-black/55 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center px-6 py-4.5 text-left text-gray-200 font-semibold hover:bg-white/5 transition-all duration-200"
              >
                <span className="text-sm md:text-base">{faq.q}</span>
                <span className={`transition-transform duration-300 shrink-0 text-cyan-400 text-2xl font-light ${openIndex === i ? 'rotate-45 text-purple-400' : ''}`}>
                  +
                </span>
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === i ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-400 text-xs md:text-sm leading-relaxed border-t border-white/5 pt-3.5">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 border border-cyan-500/15 rounded-3xl bg-black/60 backdrop-blur-md p-10 max-w-xl mx-auto shadow-xl">
        <h3 className="text-xl font-bold text-white">Still seeking answers?</h3>
        <p className="text-gray-400 text-sm mt-2">Get direct email consultations from our cyber intelligence response unit.</p>
        <button className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
          Contact Intel Support
        </button>
      </div>
    </div>
  );
}
