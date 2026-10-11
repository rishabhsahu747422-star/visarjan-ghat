import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Compass,
  BarChart3,
  Waves,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  DatabaseZap,
  ArrowUpRight
} from 'lucide-react';
import WaterRingLogo from '../ui/WaterRingLogo';
import { useFestival } from '../../context/FestivalContext';

export default function AtlasRail({ isMobileOpen = false, closeMobileDrawer = () => {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { festival, summary } = useFestival();

  const navItems = [
    {
      num: '01',
      label: 'Overview',
      path: '/app',
      exact: true,
      icon: Compass,
      desc: 'Impact Quadrant & Golden Metrics',
    },
    {
      num: '02',
      label: 'Ghat Rankings',
      path: '/app/rankings',
      exact: false,
      icon: BarChart3,
      desc: 'Multi-year CPCB Class B Ranking',
    },
    {
      num: '03',
      label: 'Ghat Explorer',
      path: '/app/ghat/khatlapura-ghat',
      exact: false,
      matchPrefix: '/app/ghat',
      icon: Waves,
      desc: '3-Phase Trends & Parameter Deltas',
    },
    {
      num: '04',
      label: 'Official Brief',
      path: '/app/brief',
      exact: false,
      icon: FileText,
      desc: 'Bilingual BMC & Jury Document',
    },
    {
      num: '05',
      label: 'Data & Methodology',
      path: '/app/methodology',
      exact: false,
      icon: Database,
      desc: 'Coverage Matrix & Gaps Register',
    },
  ];

  const isItemActive = (item) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    if (item.matchPrefix) {
      return location.pathname.startsWith(item.matchPrefix);
    }
    return location.pathname === item.path;
  };

  const railWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Desktop Atlas Rail */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-40 bg-forest text-white transition-all duration-300 shadow-elevated border-r border-forest-light/40 ${railWidth}`}
        aria-label="Atlas Rail Navigation"
      >
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden group py-1"
            title="Return to Public Landing Page"
          >
            <div className="text-bright-yellow group-hover:scale-105 transition-transform">
              <WaterRingLogo size={36} />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5 font-sans">
                  The Living Atlas
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-mono text-white/70">
                  Visarjan Ghat Watch
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/60 hover:text-white p-1 rounded-md hover:bg-forest-light/50 transition-colors focus:outline-none focus:ring-1 focus:ring-bright-yellow"
            title={collapsed ? 'Expand Atlas Rail' : 'Collapse Atlas Rail'}
            aria-label="Toggle rail collapse"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (01 - 05) */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-white/50">
              Atlas Rail · Navigation
            </div>
          )}

          {navItems.map((item) => {
            const active = isItemActive(item);
            const IconComponent = item.icon;

            return (
              <NavLink
                key={item.num}
                to={item.path}
                className={`group relative flex items-center gap-3.5 px-3 py-3 rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-bright-yellow ${
                  active
                    ? 'bg-pale-green text-forest font-semibold shadow-subtle'
                    : 'text-white/80 hover:text-white hover:bg-forest-light/60'
                }`}
                title={collapsed ? `${item.num} — ${item.label}: ${item.desc}` : undefined}
              >
                {/* Bright Yellow Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-bright-yellow rounded-r-full shadow-[0_0_8px_#FFB900]" />
                )}

                {/* Number Badge (01 - 05) */}
                <span
                  className={`font-mono text-xs px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                    active
                      ? 'bg-forest text-bright-yellow font-bold'
                      : 'text-bright-yellow/80 bg-forest-deep/60 group-hover:text-bright-yellow'
                  }`}
                >
                  {item.num}
                </span>

                {/* Lucide Outline Icon */}
                <IconComponent
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    active ? 'text-forest' : 'text-white/70 group-hover:text-white'
                  }`}
                />

                {/* Label & Description */}
                {!collapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-sm tracking-tight leading-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] truncate ${
                        active ? 'text-forest/70 font-normal' : 'text-white/50'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Dataset Status Area at Bottom */}
        <div className="p-3.5 m-2.5 rounded-xl bg-forest-deep/80 border border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-bright-yellow animate-pulse shrink-0"></div>
            {!collapsed && (
              <div className="text-xs truncate">
                <div className="font-semibold text-white/90 font-mono tracking-tight flex items-center justify-between">
                  <span>{festival} Visarjan</span>
                  <span className="text-[10px] text-bright-yellow font-normal">Active</span>
                </div>
                <div className="text-[10px] text-white/60 font-mono mt-0.5">
                  1,524 rows · 2023–2025
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <Link
              to="/"
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-forest-light/60 hover:bg-forest-light text-[11px] text-white/90 hover:text-white transition-colors"
            >
              <span>Public Landing Page</span>
              <ArrowUpRight className="w-3 h-3 text-bright-yellow" />
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={closeMobileDrawer}
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-full bg-forest text-white h-full flex flex-col shadow-2xl p-4">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <WaterRingLogo size={32} />
                <div>
                  <div className="font-bold text-sm">Visarjan Ghat Watch</div>
                  <div className="text-[10px] text-white/60 font-mono">The Living Atlas</div>
                </div>
              </div>
              <button
                onClick={closeMobileDrawer}
                className="text-white/70 hover:text-white p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = isItemActive(item);
                const IconComponent = item.icon;

                return (
                  <NavLink
                    key={item.num}
                    to={item.path}
                    onClick={closeMobileDrawer}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                      active
                        ? 'bg-pale-green text-forest font-semibold'
                        : 'text-white/80 hover:bg-forest-light'
                    }`}
                  >
                    <span className="font-mono text-xs text-bright-yellow font-bold bg-forest-deep px-1.5 py-0.5 rounded">
                      {item.num}
                    </span>
                    <IconComponent className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 text-xs text-white/70">
              <div className="font-mono text-bright-yellow font-semibold">{festival} Mode Active</div>
              <div className="text-[11px] text-white/50 mt-1">MPPCB 2023–2025 Data Pack</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
