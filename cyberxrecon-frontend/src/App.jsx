import { useState, useEffect } from 'react';
import ThreeDGalaxy from './components/background/ThreeDGalaxy';
import Footer from './components/layout/Footer';
import BackToTop from './components/layout/BackToTop';
import Navbar from './components/layout/Navbar';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import SupportPage from './pages/SupportPage';
import AuthPage from './pages/AuthPage';
import BlogPage from './pages/BlogPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authMode, setAuthMode] = useState('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scanTarget, setScanTarget] = useState('');
  const [autoStartScan, setAutoStartScan] = useState(false);

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
        return (
          <HomePage
            setCurrentPage={setCurrentPage}
          />
        );
      case 'dashboard':
        return (
          <DashboardPage
            initialTarget={scanTarget}
            autoStartScan={autoStartScan}
            clearAutoStart={() => setAutoStartScan(false)}
          />
        );
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
        @keyframes resultSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <ThreeDGalaxy />

      <div key={currentPage} className={`page-transition relative z-10 flex-1 px-4 md:px-6 pb-10 ${currentPage === 'dashboard' ? 'mt-20' : 'mt-28'}`}>
        {renderPage()}
      </div>

      <Footer />
      <BackToTop />

      <Navbar
        currentPage={currentPage}
        scrolled={scrolled}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        goToPage={goToPage}
        goToAuth={goToAuth}
      />
    </div>
  );
}

export default App;