import React from 'react';
import { Menu, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import { useFestival } from '../../context/FestivalContext';

export default function WorkspaceHeader({ title, subtitle, onOpenMobileMenu }) {
  const { festival, setFestival } = useFestival();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-forest/10 px-4 sm:px-8 py-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Mobile trigger & Page Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-charcoal hover:bg-forest/5 hover:text-forest transition-colors"
            aria-label="Open Atlas Rail"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-sans text-charcoal tracking-tight">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-pale-green text-forest border border-forest/20">
                <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
                The Living Atlas
              </span>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-grey mt-0.5 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Festival Switcher & Dataset Status */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          {/* Festival Switcher Toggle */}
          <div
            className="inline-flex items-center p-1 bg-light-grey rounded-xl border border-forest/15 shadow-inner"
            role="group"
            aria-label="Festival Selection"
          >
            <button
              type="button"
              onClick={() => setFestival('Durga')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                festival === 'Durga'
                  ? 'bg-forest text-white shadow-sm ring-1 ring-forest-deep'
                  : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
              }`}
            >
              <span>Durga Visarjan</span>
              {festival === 'Durga' && (
                <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFestival('Ganesh')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                festival === 'Ganesh'
                  ? 'bg-forest text-white shadow-sm ring-1 ring-forest-deep'
                  : 'text-charcoal/70 hover:text-charcoal hover:bg-white/60'
              }`}
            >
              <span>Ganesh Visarjan</span>
              {festival === 'Ganesh' && (
                <span className="w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
              )}
            </button>
          </div>

          {/* Dataset Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-pale-green/70 border border-forest/20 text-forest text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            <span>2023–2025 Data</span>
          </div>
        </div>
      </div>
    </header>
  );
}
