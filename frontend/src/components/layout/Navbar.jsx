import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Menu, X } from 'lucide-react';
import WaterRingLogo from '../ui/WaterRingLogo';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md border-b border-forest/10 shadow-subtle py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Wordmark */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="text-forest group-hover:text-forest-deep transition-colors">
              <WaterRingLogo size={36} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg tracking-tight text-charcoal font-sans flex items-center gap-1.5">
                Visarjan Ghat Watch
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-mono text-muted-grey">
                Bhopal Water Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-charcoal">
            <a
              href="#about"
              className="text-charcoal/80 hover:text-forest transition-colors hover:underline decoration-bright-yellow decoration-2 underline-offset-8"
            >
              About Platform
            </a>
            <a
              href="#how-it-works"
              className="text-charcoal/80 hover:text-forest transition-colors hover:underline decoration-bright-yellow decoration-2 underline-offset-8"
            >
              How It Works
            </a>
            <a
              href="#bhopal-story"
              className="text-charcoal/80 hover:text-forest transition-colors hover:underline decoration-bright-yellow decoration-2 underline-offset-8"
            >
              Bhopal Lakes
            </a>
            <Link
              to="/app/methodology"
              className="text-charcoal/80 hover:text-forest transition-colors hover:underline decoration-bright-yellow decoration-2 underline-offset-8"
            >
              Methodology
            </Link>
          </div>

          {/* Action Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-forest text-white text-sm font-semibold hover:bg-forest-deep transition-all duration-200 shadow-sm hover:shadow-card group"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4 text-bright-yellow group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-charcoal hover:text-forest hover:bg-forest/5"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-forest/10 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-charcoal hover:bg-pale-green rounded-md"
          >
            About Platform
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-charcoal hover:bg-pale-green rounded-md"
          >
            How It Works
          </a>
          <a
            href="#bhopal-story"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-charcoal hover:bg-pale-green rounded-md"
          >
            Bhopal Lakes
          </a>
          <Link
            to="/app/methodology"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-charcoal hover:bg-pale-green rounded-md"
          >
            Methodology
          </Link>
          <div className="pt-2">
            <Link
              to="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-forest text-white font-semibold text-center"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-4 h-4 text-bright-yellow" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
