import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import ForceGraph2D from 'react-force-graph-2d';

// --- ROUND STAR TEXTURE ---
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

// --- SHADERS ---
const starVertexShader = `
  attribute float size;
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = `
  uniform sampler2D pointTexture;
  varying vec3 vColor;
  void main() {
    vec4 tex = texture2D(pointTexture, gl_PointCoord);
    gl_FragColor = vec4(vColor, 1.0) * tex;
  }
`;

// --- 3D GALAXY BACKGROUND ---
function ThreeDGalaxy() {
  const mountRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.0015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const count = 4000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const twinkleSpeeds = new Float32Array(count);
    const color = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 60;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i*3] = x;
      positions[i*3+1] = y * 0.3;
      positions[i*3+2] = z;
      color.setHSL(0.6 + Math.random() * 0.3, 0.7, 0.4 + Math.random() * 0.5);
      colors[i*3] = color.r;
      colors[i*3+1] = color.g;
      colors[i*3+2] = color.b;

      sizes[i] = 0.1 + Math.random() * 0.3;
      twinkleSpeeds[i] = 0.5 + Math.random() * 2.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: createStarTexture() },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    const handleMouseMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      scrollRef.current = scrollY / maxScroll;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      const sizeAttr = geometry.attributes.size;
      const sizeArray = sizeAttr.array;

      for (let i = 0; i < count; i++) {
        sizeArray[i] = 0.1 + Math.abs(Math.sin(time * twinkleSpeeds[i])) * 0.3;
      }
      sizeAttr.needsUpdate = true;

      const targetRotX = -Math.PI + scrollRef.current * (Math.PI * 2);
      const targetRotY = mouseRef.current.x * 0.3;
      stars.rotation.x += (targetRotX - stars.rotation.x) * 0.035;
      stars.rotation.y += (targetRotY - stars.rotation.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      currentMount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none bg-black" />;
}

// --- TERMINAL TYPING EFFECT ---
function TerminalTyping() {
  const lines = [
    'Scanning target.com...',
    'Resolving subdomains... 14 found',
    'Harvesting emails... 6 found',
    'Checking breach databases... 2 matches',
    'Report ready.',
  ];
  const [displayed, setDisplayed] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      const resetTimer = setTimeout(() => {
        setDisplayed('');
        setLineIndex(0);
        setCharIndex(0);
      }, 1800);
      return () => clearTimeout(resetTimer);
    }
    const currentLine = lines[lineIndex];
    if (charIndex < currentLine.length) {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + currentLine[charIndex]);
        setCharIndex((c) => c + 1);
      }, 35);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayed((prev) => prev + '\n');
        setLineIndex((l) => l + 1);
        setCharIndex(0);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [charIndex, lineIndex]);

  return (
    <div className="mt-10 max-w-md mx-auto bg-black/60 border border-cyan-500/30 rounded-lg p-4 text-left font-mono text-sm text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
      <div className="flex space-x-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500/70"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70"></span>
        <span className="w-2.5 h-2.5 rounded-full bg-green-500/70"></span>
      </div>
      <pre className="whitespace-pre-wrap min-h-[110px]">{displayed}<span className="animate-pulse">▋</span></pre>
    </div>
  );
}

// --- FEATURE CARD ---
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group relative border border-white/10 bg-black/50 backdrop-blur-md rounded-2xl p-6 hover:border-cyan-500/40 hover:bg-black/70 transition-all duration-300 text-left overflow-hidden shadow-lg shadow-black/50 hover:shadow-cyan-500/5">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      <div className="text-3xl mb-4 transform group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300 inline-block">{icon}</div>
      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-200">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

// --- STATS ELEMENT ---
function StatItem({ value, label }) {
  return (
    <div className="px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 backdrop-blur-sm">
      <div className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">{value}</div>
      <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

// --- HOME PAGE ---
function HomePage({ setCurrentPage }) {
  const features = [
    { icon: '🛰️', title: 'Port Scanning', desc: 'Automated TCP scans surface open ports and running services on any target.' },
    { icon: '🌐', title: 'Subdomain Enum', desc: 'Discovers hidden subdomains across a target’s attack surface using multiple engines.' },
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
          Explore Pricing & Subscriptions →
        </button>
      </div>
    </div>
  );
}

// --- PRICING PAGE ---
function PricingPage() {
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

// --- SUPPORT PAGE ---
function SupportPage() {
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
      <h2 className="text-4xl font-extrabold tracking-tight">Support & Docs Hub</h2>
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

// --- AUTH PAGE ---
function AuthPage({ mode, setMode }) {
  const isSignUp = mode === 'signup';

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleOAuth = () => {};

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isSignUp ? 'Start your recon journey with CyberXRecon' : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 16.2 4 9.5 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C39.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-[#181717] text-white font-medium hover:bg-[#2b2b2b] transition border border-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />

          {!isSignUp && (
            <div className="text-right">
              <a href="#forgot" className="text-xs text-cyan-400 hover:underline">Forgot password?</a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
            className="text-cyan-400 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

// --- BLOG PAGE ---
function BlogPage() {
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

// --- MODULE DATA ---
const moduleDetails = {
  ports: {
    icon: '🛰️',
    title: 'Port Scan',
    summary: 'Nmap-style TCP scan against common service ports.',
    items: [
      '22/tcp ssh open — OpenSSH 8.9',
      '80/tcp http open — nginx 1.24.0',
      '443/tcp https open — nginx 1.24.0 (TLS 1.3)',
      '3306/tcp filtered — firewall blocking',
      '8080/tcp closed',
    ],
  },
  subdomains: {
    icon: '🌐',
    title: 'Subdomains',
    summary: 'Enumeration across DNS and certificate transparency sources.',
    items: [
      'mail.target.com — resolves',
      'api.target.com — resolves',
      'dev.target.com — resolves',
      'staging.target.com — resolves',
      'cdn.target.com — resolves',
      'old.target.com — no response',
    ],
  },
  phone: {
    icon: '📱',
    title: 'Phone OSINT',
    summary: 'Carrier and line-type lookup for discovered numbers.',
    items: [
      'Carrier: Reliance Jio',
      'Region: Maharashtra, IN',
      'Line type: Mobile',
      'Valid number: Yes',
    ],
  },
  social: {
    icon: '🕵️',
    title: 'Social Media',
    summary: 'Username presence check across common platforms.',
    items: [
      'GitHub — 12 repos found',
      'Twitter/X — profile found',
      'Reddit — not found',
      'LinkedIn — not checked',
      'Instagram — profile found',
    ],
  },
  emails: {
    icon: '✉️',
    title: 'Emails',
    summary: 'Harvested addresses with their discovery source.',
    items: [
      'admin@target.com — source: WHOIS',
      'support@target.com — source: contact page',
      'info@target.com — source: DNS TXT record',
    ],
  },
  breach: {
    icon: '🔓',
    title: 'Breach Check',
    summary: 'Cross-reference against known breach compilations.',
    items: [
      'Collection #1 (2019) — 773M records',
      'Exploit.in (2020) — 593M records',
    ],
  },
};

const moduleOrder = ['ports', 'subdomains', 'phone', 'social', 'emails', 'breach'];

// --- MODULE DETAIL MODAL ---
function ModuleDetailModal({ moduleKey, onClose }) {
  if (!moduleKey) return null;
  const mod = moduleDetails[moduleKey];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-black/90 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{mod.icon}</span>
            <div>
              <h3 className="text-lg font-bold text-cyan-400">{mod.title}</h3>
              <p className="text-xs text-gray-500">{mod.summary}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <ul className="mt-5 space-y-2 text-sm text-gray-300 font-mono border-t border-white/10 pt-4">
          {mod.items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-cyan-400">›</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- RESULT POPUP ---
function ResultPopup({ corner, icon, title, items, stage, mergeTransform, registerRef, onOpen }) {
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

// --- HISTORY SIDEBAR ---
function HistorySidebar({ open, onClose, history, onSelect }) {
  return (
    <>
      <div
        className={`fixed top-0 right-0 h-full w-72 z-[90] bg-black/85 backdrop-blur-xl border-l border-cyan-500/20 transition-transform duration-500 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-cyan-400 font-semibold">Scan History</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 70px)' }}>
          {history.length === 0 && (
            <p className="text-gray-600 text-sm text-center mt-10">No scans yet this session.</p>
          )}
          {history.map((h) => (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="w-full text-left border border-white/10 rounded-lg p-3 hover:border-cyan-500/40 hover:bg-white/5 transition"
            >
              <p className="text-sm text-gray-200 font-medium truncate">{h.target}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">{h.timestamp}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    h.risk === 'High'
                      ? 'bg-red-500/20 text-red-400'
                      : h.risk === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {h.risk}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      {open && <div className="fixed inset-0 z-[80] bg-black/40" onClick={onClose} />}
    </>
  );
}

// ============================================================
// --- INTELLIGENCE DASHBOARD: 4-PANEL SPIDERFOOT-STYLE VIEW ---
// ============================================================

// Shared data shape used by every panel, built once per graph open
function buildDashboardData(target) {
  const modules = moduleOrder.map((key, i) => ({
    key,
    ...moduleDetails[key],
    color: i % 2 === 0 ? '#22d3ee' : '#a855f7',
  }));
  const totalFindings = modules.reduce((sum, m) => sum + m.items.length, 0);
  return { target, modules, totalFindings };
}

// Fixed-position (non-simulated) node/link graph — deterministic angles,
// so nothing ever drifts into an overlap regardless of screen size.
function buildNetworkGraph(target) {
  const nodes = [{ id: 'root', label: target, group: 1, fx: 0, fy: 0 }];
  const links = [];

  const moduleRadius = 140;
  const findingRadius = 260;
  const angleStep = (Math.PI * 2) / moduleOrder.length;

  moduleOrder.forEach((key, index) => {
    const mod = moduleDetails[key];
    const color = index % 2 === 0 ? '#22d3ee' : '#a855f7';
    const catId = `cat-${key}`;
    const modAngle = index * angleStep;
    const modX = Math.cos(modAngle) * moduleRadius;
    const modY = Math.sin(modAngle) * moduleRadius;

    nodes.push({ id: catId, label: mod.title, icon: mod.icon, group: 2, color, fx: modX, fy: modY });
    links.push({ source: 'root', target: catId });

    const totalLeaves = mod.items.length;
    // Cap each module's leaf spread to 70% of its angular sector so it can
    // never reach into a neighbouring module's leaves, at any leaf count.
    const increment = totalLeaves > 1 ? Math.min(0.32, (angleStep * 0.7) / (totalLeaves - 1)) : 0;

    mod.items.forEach((item, leafIdx) => {
      const leafId = `${key}-${leafIdx}`;
      const leafSpread = modAngle + (leafIdx - (totalLeaves - 1) / 2) * increment;
      const leafX = Math.cos(leafSpread) * findingRadius;
      const leafY = Math.sin(leafSpread) * findingRadius;
      const shortLabel = item.length > 24 ? item.slice(0, 22) + '…' : item;

      nodes.push({ id: leafId, label: shortLabel, group: 3, color, fx: leafX, fy: leafY });
      links.push({ source: catId, target: leafId });
    });
  });

  return { nodes, links };
}

// --- Panel 1: force-directed entity relationship map ---
function NetworkGraphPanel({ target }) {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [dims, setDims] = useState({ w: 400, h: 300 });
  const graphData = useRef(buildNetworkGraph(target));
  const { nodes, links } = graphData.current;

  useEffect(() => {
    const updateDims = () => {
      if (containerRef.current) {
        setDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    };
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (graphRef.current) graphRef.current.zoomToFit(500, 36);
    }, 150);
    return () => clearTimeout(t);
  }, [dims]);

  const nodeCanvasObject = (node, ctx) => {
    const isRoot = node.group === 1;
    const isModule = node.group === 2;
    ctx.save();

    if (isRoot) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
      ctx.fillStyle = '#0a0a14';
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#22d3ee';
      ctx.shadowColor = 'rgba(34,211,238,0.6)';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', node.x, node.y);
      ctx.font = '700 10px Inter, sans-serif';
      ctx.fillStyle = '#e5e7eb';
      ctx.fillText(node.label, node.x, node.y + 32);
    } else if (isModule) {
      const w = 112, h = 30;
      const x = node.x - w / 2, y = node.y - h / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fillStyle = '#0d0d18';
      ctx.fill();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = node.color;
      ctx.shadowColor = node.color + '99';
      ctx.shadowBlur = 7;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.icon, x + 8, node.y);
      ctx.font = '700 9px Inter, sans-serif';
      ctx.fillStyle = '#f1f5f9';
      ctx.fillText(node.label, x + 25, node.y);
    } else {
      ctx.font = '500 8px Inter, sans-serif';
      const tw = ctx.measureText(node.label).width;
      const w = tw + 14, h = 16;
      const x = node.x - w / 2, y = node.y - h / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = (node.color || '#475569') + '80';
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
    }
    ctx.restore();
  };

  return (
    <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-cyan-400">🕸️</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Entity Relationship Map</h3>
      </div>
      <div ref={containerRef} className="flex-1 relative min-h-0">
        <ForceGraph2D
          ref={graphRef}
          width={dims.w}
          height={dims.h}
          graphData={{ nodes, links }}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI);
            ctx.fill();
          }}
          backgroundColor="rgba(0,0,0,0)"
          linkColor={() => 'rgba(148,163,184,0.25)'}
          linkWidth={1}
          d3AlphaDecay={1}
          cooldownTicks={0}
          enableZoom={true}
          enablePan={true}
        />
      </div>
    </div>
  );
}

// --- Small hand-drawn donut used by the overview panel ---
function DonutStat({ percent, color, value, label }) {
  const size = 84, stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(Math.max(percent, 0), 1));
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={c} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-extrabold text-white">{value}</span>
        </div>
      </div>
      <span className="text-[9px] uppercase tracking-wider text-gray-400 font-semibold text-center leading-tight">{label}</span>
    </div>
  );
}

// --- Panel 2: scan overview — donuts + per-module bar breakdown ---
function OverviewPanel({ data }) {
  const { modules, totalFindings } = data;
  const maxItems = Math.max(...modules.map((m) => m.items.length));

  return (
    <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-purple-400">📊</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Scan Overview</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          <DonutStat percent={1} color="#22d3ee" value={`${modules.length}/${modules.length}`} label="Modules Run" />
          <DonutStat percent={totalFindings / (modules.length * maxItems)} color="#a855f7" value={totalFindings} label="Findings" />
          <DonutStat percent={0.62} color="#f59e0b" value="Med" label="Risk Level" />
        </div>
        <div className="mt-6 space-y-2.5">
          {modules.map((m) => (
            <div key={m.key} className="flex items-center gap-2">
              <span className="text-sm w-5 shrink-0">{m.icon}</span>
              <span className="text-[11px] text-gray-300 w-[92px] shrink-0 truncate">{m.title}</span>
              <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(m.items.length / maxItems) * 100}%`, background: m.color }}
                />
              </div>
              <span className="text-[10px] text-gray-500 w-4 text-right shrink-0">{m.items.length}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Panel 3: hierarchical recon tree (target -> module -> finding) ---
function TreePanel({ data }) {
  const [openKeys, setOpenKeys] = useState(() => new Set(moduleOrder));
  const toggle = (key) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-cyan-400">🌳</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Recon Tree</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs">
        <div className="text-cyan-300 font-bold flex items-center gap-1.5">
          <span>🎯</span> {data.target}
        </div>
        <div className="ml-2 border-l border-white/10 pl-3 mt-2 space-y-2">
          {data.modules.map((m) => (
            <div key={m.key}>
              <button
                onClick={() => toggle(m.key)}
                className="flex items-center gap-1.5 text-left hover:opacity-80 transition-opacity w-full"
                style={{ color: m.color }}
              >
                <span className="text-[9px] w-3 shrink-0">{openKeys.has(m.key) ? '▾' : '▸'}</span>
                <span>{m.icon}</span>
                <span className="font-semibold">{m.title}</span>
                <span className="text-gray-500">({m.items.length})</span>
              </button>
              {openKeys.has(m.key) && (
                <div className="ml-4 border-l border-white/10 pl-3 mt-1.5 space-y-1.5">
                  {m.items.map((item) => (
                    <div key={item} className="text-gray-400 truncate">› {item}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Panel 4: radial correlation map (circular, chord-style) ---
function RadialPanel({ data }) {
  const size = 340;
  const cx = size / 2, cy = size / 2;
  const hubR = 24;
  const nodeR = 118;

  const flat = [];
  data.modules.forEach((m) => {
    m.items.forEach((item) => flat.push({ module: m, item }));
  });
  const n = flat.length;
  const positions = flat.map((f, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return { ...f, x: cx + Math.cos(angle) * nodeR, y: cy + Math.sin(angle) * nodeR, angle };
  });

  return (
    <div className="relative bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-0">
      <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-purple-400">🔗</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-white">Correlation Map</h3>
      </div>
      <div className="flex-1 flex items-center justify-center p-2 overflow-hidden min-h-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full max-w-[380px] max-h-[380px]">
          {positions.map((p, i) => (
            <line key={`spoke-${i}`} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={p.module.color} strokeOpacity="0.16" strokeWidth="1" />
          ))}
          {data.modules.map((m) => {
            const items = positions.filter((p) => p.module.key === m.key);
            if (items.length < 2) return null;
            return items.slice(1).map((p, i) => {
              const prev = items[i];
              return (
                <path
                  key={`${m.key}-chord-${i}`}
                  d={`M ${prev.x} ${prev.y} Q ${cx} ${cy} ${p.x} ${p.y}`}
                  fill="none"
                  stroke={m.color}
                  strokeOpacity="0.32"
                  strokeWidth="1"
                />
              );
            });
          })}
          <circle cx={cx} cy={cy} r={hubR} fill="#0a0a14" stroke="#22d3ee" strokeWidth="2.5" />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="15">🎯</text>
          {positions.map((p, i) => (
            <circle key={`node-${i}`} cx={p.x} cy={p.y} r="4" fill={p.module.color} />
          ))}
          {data.modules.map((m, mi) => {
            const items = positions.filter((p) => p.module.key === m.key);
            if (items.length === 0) return null;
            const avgAngle = items.reduce((s, p) => s + p.angle, 0) / items.length;
            const ringOffset = mi % 2 === 0 ? 32 : 48;
            const lx = cx + Math.cos(avgAngle) * (nodeR + ringOffset);
            const ly = cy + Math.sin(avgAngle) * (nodeR + ringOffset);
            return (
              <text
                key={m.key}
                x={lx}
                y={ly}
                fill={m.color}
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {m.icon} {m.title}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// --- The dashboard shell: loading state + 2x2 grid of the four panels ---
function GraphViewPage({ target, onClose }) {
  const [phase, setPhase] = useState('loading');
  const dashboardData = useRef(buildDashboardData(target));

  useEffect(() => {
    const t = setTimeout(() => setPhase('ready'), 650);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050509] text-gray-200 overflow-hidden select-none">
      {phase === 'loading' && (
        <div className="absolute inset-0 z-10 bg-[#050509] flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-cyan-400 text-xs mt-4 tracking-wider uppercase font-semibold">
            Building intelligence dashboard for <span className="font-bold text-white">{target}</span>...
          </p>
        </div>
      )}

      <div className="w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-black/60 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-cyan-400 font-bold flex items-center gap-2">🕸️ CyberXRecon Intelligence Workspace</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Target: <strong className="text-white">{target}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition font-semibold"
          >
            ✕ Close
          </button>
        </div>

        {phase === 'ready' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden min-h-0">
            <NetworkGraphPanel target={target} />
            <OverviewPanel data={dashboardData.current} />
            <TreePanel data={dashboardData.current} />
            <RadialPanel data={dashboardData.current} />
          </div>
        )}
      </div>
    </div>
  );
}

// --- DASHBOARD PAGE ---
function DashboardPage() {
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);
  const [terminalLines, setTerminalLines] = useState([
    'CyberXRecon terminal ready.',
    'Enter a target above and click "Run Scan" to begin.',
  ]);
  const [popupStage, setPopupStage] = useState({
    ports: 'hidden', subdomains: 'hidden', phone: 'hidden', social: 'hidden', emails: 'hidden', breach: 'hidden',
  });
  const [mergeTransforms, setMergeTransforms] = useState({});
  const [progress, setProgress] = useState(0);
  const [riskLevel, setRiskLevel] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy Report');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [graphOpen, setGraphOpen] = useState(false);

  const terminalRef = useRef(null);
  const popupNodeRefs = useRef({});
  const registerRef = (key, el) => { popupNodeRefs.current[key] = el; };

  const pushLine = (line) => setTerminalLines((prev) => [...prev, line]);

  const computeMergeTransform = (key) => {
    const popupEl = popupNodeRefs.current[key];
    const termEl = terminalRef.current;
    if (!popupEl || !termEl) return 'scale(0)';
    const popupRect = popupEl.getBoundingClientRect();
    const termRect = termEl.getBoundingClientRect();
    const dx = (termRect.left + termRect.width / 2) - (popupRect.left + popupRect.width / 2);
    const dy = (termRect.top + termRect.height / 2) - (popupRect.top + popupRect.height / 2);
    return `translate(${dx}px, ${dy}px) scale(0)`;
  };

  const runScan = () => {
    if (running) return;
    const t = target.trim() || 'target.com';

    setRunning(true);
    setTerminalLines([]);
    setPopupStage({ ports: 'hidden', subdomains: 'hidden', phone: 'hidden', social: 'hidden', emails: 'hidden', breach: 'hidden' });
    setMergeTransforms({});
    setProgress(0);
    setRiskLevel(null);
    setCopyStatus('Copy Report');

    const totalSteps = 2 + moduleOrder.length + 2;
    let stepsDone = 0;
    const bump = () => {
      stepsDone += 1;
      setProgress(Math.round((stepsDone / totalSteps) * 100));
    };

    let delay = 0;
    const schedule = (fn, wait) => {
      delay += wait;
      setTimeout(fn, delay);
    };

    schedule(() => { pushLine(`> Initializing scan on ${t}...`); bump(); }, 500);
    schedule(() => { pushLine(`> Deploying ${moduleOrder.length} recon modules...`); bump(); }, 700);

    moduleOrder.forEach((key, i) => {
      schedule(() => {
        pushLine(`> [${i + 1}/${moduleOrder.length}] ${moduleDetails[key].title} engaged`);
        setPopupStage((p) => ({ ...p, [key]: 'visible' }));
        bump();
      }, 700);
    });

    schedule(() => pushLine('> All modules complete. Merging results into report...'), 1500);

    schedule(() => {
      const transforms = {};
      moduleOrder.forEach((key) => { transforms[key] = computeMergeTransform(key); });
      setMergeTransforms(transforms);
      setPopupStage((p) => {
        const next = { ...p };
        moduleOrder.forEach((key) => (next[key] = 'merging'));
        return next;
      });
      bump();
    }, 500);

    schedule(() => {
      moduleOrder.forEach((key) => {
        pushLine(`—— ${moduleDetails[key].title} ——`);
        moduleDetails[key].items.forEach((item) => pushLine(`  ${item}`));
      });
      pushLine('> Scan complete. Report generated.');
      const risk = 'Medium';
      setRiskLevel(risk);
      setScanHistory((prev) => [
        { id: Date.now(), target: t, timestamp: new Date().toLocaleString(), risk },
        ...prev,
      ]);
      bump();
      setRunning(false);
    }, 1100);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(terminalLines.join('\n'));
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus('Copy Report'), 1800);
    } catch {
      setCopyStatus('Copy failed');
      setTimeout(() => setCopyStatus('Copy Report'), 1800);
    }
  };

  const handleDownload = () => {
    const report = {
      target: target.trim() || 'target.com',
      generatedAt: new Date().toISOString(),
      riskLevel,
      modules: moduleOrder.reduce((acc, key) => {
        acc[key] = moduleDetails[key].items;
        return acc;
      }, {}),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberxrecon-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const scanComplete = !running && riskLevel !== null;

  return (
    <div className="text-center max-w-5xl mx-auto pt-8 md:pt-12 px-4">
      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: floatBob 3.2s ease-in-out infinite; }
      `}</style>

      <div className="flex items-center justify-center gap-3">
        <h2 className="text-3xl font-extrabold text-white tracking-tight">OSINT Dashboard</h2>
        <button
          onClick={() => setHistoryOpen(true)}
          className="text-xs px-3 py-1.5 border border-white/10 rounded-full text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40 bg-white/[0.02] backdrop-blur-sm transition-all"
        >
          🕘 History {scanHistory.length > 0 && `(${scanHistory.length})`}
        </button>
      </div>
      <p className="text-gray-400 mt-2 text-sm">Deploy automated target analysis and monitor real-time threat maps.</p>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-3.5 mt-10 max-w-lg mx-auto relative z-20">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-500 text-sm">🎯</div>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target domain, IP, email, or username..."
            className="w-full pl-10 pr-5 py-3 rounded-full bg-black/60 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/20 transition-all duration-300 shadow-inner"
          />
        </div>
        <button
          onClick={runScan}
          disabled={running}
          className={`px-8 py-3 rounded-full font-bold whitespace-nowrap transition-all duration-300 w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] ${
            running
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
              : 'bg-gradient-to-r from-cyan-400 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/20'
          }`}
        >
          {running ? 'Running Scans...' : 'Run Scan'}
        </button>
      </div>

      <div
        ref={terminalRef}
        className="crt-container crt-scanline relative z-10 mx-auto max-w-2xl bg-black/85 border border-cyan-500/35 rounded-xl p-5 text-left font-mono text-sm text-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)] mt-16 overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border border-cyan-500/10">
          <div className="flex space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.5)]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.5)]"></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-500/60 animate-pulse">Scanning Unit</span>
            {riskLevel && (
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide shadow-md border ${
                  riskLevel === 'High'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-red-500/10 animate-pulse'
                    : riskLevel === 'Medium'
                    ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 shadow-yellow-500/10'
                    : 'bg-green-500/10 border-green-500/30 text-green-400 shadow-green-500/10'
                }`}
              >
                Risk: {riskLevel}
              </span>
            )}
          </div>
        </div>

        {(running || progress > 0) && (
          <div className="h-1.5 w-full bg-cyan-950/40 border border-cyan-500/15 rounded-full overflow-hidden mb-4 relative">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <pre className="whitespace-pre-wrap min-h-[180px] max-h-80 overflow-y-auto pr-2 leading-relaxed text-cyan-400/90 text-xs md:text-sm selection:bg-cyan-500/20 select-text">
          {terminalLines.join('\n')}
          {running && <span className="animate-pulse">▋</span>}
        </pre>

        {scanComplete && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-cyan-500/15">
            <button
              onClick={handleCopy}
              className="flex-1 text-xs py-2.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all font-semibold uppercase tracking-wider"
            >
              {copyStatus}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 text-xs py-2.5 rounded-lg border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 transition-all font-semibold uppercase tracking-wider"
            >
              Download JSON
            </button>
            <button
              onClick={() => setGraphOpen(true)}
              className="flex-1 text-xs py-2.5 rounded-lg border border-cyan-400/40 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-300 hover:from-cyan-500/20 hover:to-purple-500/20 hover:border-cyan-300 transition-all flex items-center justify-center gap-1 font-bold uppercase tracking-wider"
            >
              🕸️ Maltego Intelligence Graph
              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-black text-cyan-400 font-extrabold border border-cyan-500/30">PRO</span>
            </button>
          </div>
        )}
      </div>

      {moduleOrder.map((key) => (
        <ResultPopup
          key={key}
          corner={key}
          icon={moduleDetails[key].icon}
          title={moduleDetails[key].title}
          items={moduleDetails[key].items}
          stage={popupStage[key]}
          mergeTransform={mergeTransforms[key]}
          registerRef={registerRef}
          onOpen={setOpenModule}
        />
      ))}

      <ModuleDetailModal moduleKey={openModule} onClose={() => setOpenModule(null)} />

      <HistorySidebar
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={scanHistory}
        onSelect={(h) => {
          setTarget(h.target);
          setHistoryOpen(false);
        }}
      />

      {graphOpen && (
        <GraphViewPage target={target.trim() || 'target.com'} onClose={() => setGraphOpen(false)} />
      )}
    </div>
  );
}

// --- FOOTER & MISC ---
function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 mt-24 px-6 md:px-10 py-12 text-gray-500 text-sm bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-bold">CyberXRecon</span>
          <span className="text-gray-600 text-xs">|</span>
          <span className="text-xs text-gray-400">Galactic Intelligence OSINT Platform</span>
        </div>
        <div className="flex gap-6 text-xs font-semibold uppercase tracking-wider">
          <a href="#github" className="hover:text-cyan-400 transition-colors duration-200">GitHub</a>
          <a href="#docs" className="hover:text-cyan-400 transition-colors duration-200">Docs</a>
          <a href="#contact" className="hover:text-cyan-400 transition-colors duration-200">Contact</a>
        </div>
      </div>
      <p className="text-center mt-8 max-w-2xl mx-auto text-[11px] text-gray-600 leading-relaxed">
        ⚠ NOTICE: For authorized security scanning and digital footprinting research only. You are solely responsible for ensuring authorization. Misuse of threat intelligence scripts is strictly prohibited under federal regulations.
      </p>
    </footer>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-[70] w-11 h-11 rounded-full bg-black/80 border border-cyan-500/40 backdrop-blur-md text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-500/10 hover:border-cyan-300 transition-all duration-300 flex items-center justify-center ${
        show ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
      }`}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

// --- MAIN APP ---
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const goToAuth = (mode) => {
    setAuthMode(mode);
    setCurrentPage('auth');
    setMobileMenuOpen(false);
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'dashboard':
        return <DashboardPage />;
      case 'pricing':
        return <PricingPage />;
      case 'blog':
        return <BlogPage />;
      case 'support':
        return <SupportPage />;
      case 'auth':
        return <AuthPage mode={authMode} setMode={setAuthMode} setCurrentPage={setCurrentPage} />;
      default:
        return <div className="text-center font-mono py-24 text-gray-500">404 - Node Not Found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col text-gray-200 relative overflow-x-hidden">
      <style>{`
        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .page-transition { animation: pageFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <ThreeDGalaxy />

      <div key={currentPage} className="page-transition relative z-10 flex-1 mt-28 px-4 md:px-10 pb-10">
        {renderPage()}
      </div>

      <Footer />
      <BackToTop />

      <nav
        className={`fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
          scrolled
            ? 'bg-black/75 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.8)] py-3.5'
            : 'bg-transparent border-b border-transparent py-5'
        }`}
      >
        <h1
          onClick={() => goToPage('home')}
          className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 cursor-pointer tracking-wider hover:opacity-90 transition-opacity"
        >
          CyberXRecon
        </h1>

        <div className="hidden md:flex space-x-1.5 items-center">
          {['Home', 'Dashboard', 'Pricing', 'Blog', 'Support'].map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page.toLowerCase())}
              className={`px-4 py-2 rounded-full transition-all duration-200 text-xs uppercase tracking-wider font-semibold pointer-events-auto ${
                currentPage === page.toLowerCase()
                  ? 'bg-white/10 text-white border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <div className="hidden md:flex space-x-3 pointer-events-auto items-center">
          <button
            onClick={() => goToAuth('signin')}
            className="text-xs uppercase tracking-wider font-bold px-6 py-2 border border-gray-700 text-gray-300 rounded-full hover:bg-white/10 hover:border-gray-500 transition-all"
          >
            Sign In
          </button>
          <button
            onClick={() => goToAuth('signup')}
            className="text-xs uppercase tracking-wider font-bold px-6 py-2 bg-gradient-to-r from-cyan-400 to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Sign Up
          </button>
        </div>

        <button
          onClick={() => setMobileMenuOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2 bg-white/[0.02] border border-white/10 rounded-lg"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-cyan-400 transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cyan-400 transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cyan-400 transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      <div
        className={`fixed left-0 w-full z-40 md:hidden bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-350 ease-out overflow-hidden shadow-2xl ${
          mobileMenuOpen ? 'top-[68px] max-h-96 opacity-100' : 'top-[-200px] max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col px-6 py-5 gap-2.5">
          {['Home', 'Dashboard', 'Pricing', 'Blog', 'Support'].map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page.toLowerCase())}
              className={`text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${
                currentPage === page.toLowerCase()
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {page}
            </button>
          ))}
          <div className="flex gap-3 mt-3 pt-4 border-t border-white/5">
            <button
              onClick={() => goToAuth('signin')}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-300 rounded-full hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-wider"
            >
              Sign In
            </button>
            <button
              onClick={() => goToAuth('signup')}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full hover:shadow-lg transition-all text-xs font-bold uppercase tracking-wider"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;