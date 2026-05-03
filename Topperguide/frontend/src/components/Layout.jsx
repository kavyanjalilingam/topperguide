import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

// Animated background particles
const ParticleField = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full filter blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full filter blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-neon-pink/5 rounded-full filter blur-[80px] animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30" />
    </div>
  );
};

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <ParticleField />
      
      {/* Noise texture */}
      <div className="noise-overlay" />

      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="mx-4 mt-4">
          <div className="glass-card px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)'
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold text-white group-hover:text-neon-blue transition-colors">
                    TopperGuide
                  </h1>
                  <p className="text-xs text-gray-400">AI-Powered Study Assistant</p>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-2">
                <Link to="/">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      location.pathname === '/' 
                        ? 'bg-white/10 text-neon-blue' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span className="text-sm font-medium">Home</span>
                  </motion.div>
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pt-4 border-t border-white/10"
              >
                <Link 
                  to="/"
                  className="block px-4 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Sparkles className="w-4 h-4 text-neon-blue" />
              <span>TopperGuide © 2024</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with AI • Study Smarter, Not Harder
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
