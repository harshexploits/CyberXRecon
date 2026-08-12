export default function Footer() {
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
