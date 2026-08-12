export default function Navbar({ currentPage, scrolled, mobileMenuOpen, setMobileMenuOpen, goToPage, goToAuth }) {
  return (
    <>
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

      {/* Mobile menu */}
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
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-bold rounded-full hover:shadow-lg transition-all text-xs uppercase tracking-wider"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
