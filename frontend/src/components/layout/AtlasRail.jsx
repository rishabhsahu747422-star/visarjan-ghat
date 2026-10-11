import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Compass,
  BarChart3,
  Waves,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  X
} from 'lucide-react';
import WaterRingLogo from '../ui/WaterRingLogo';
import { useFestival } from '../../context/FestivalContext';

export default function AtlasRail({
  collapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  closeMobileDrawer = () => {},
}) {
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
      {/* Desktop Atlas Rail (White Background, Forest Green Accents) */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 bottom-0 left-0 z-40 bg-white text-forest transition-all duration-300 ease-in-out shadow-subtle border-r border-gray-200 ${railWidth}`}
        aria-label="Atlas Rail Navigation"
      >
        {/* Brand Header */}
        <div
          className={`shrink-0 border-b border-gray-200 transition-all duration-300 ${
            collapsed ? 'p-3 flex flex-col items-center gap-2' : 'p-4 flex items-center justify-between'
          }`}
        >
          <Link
            to="/"
            className="flex items-center gap-3 overflow-hidden group py-1"
            title="Return to Public Landing Page"
          >
            <div className="text-forest group-hover:scale-105 transition-transform shrink-0">
              <WaterRingLogo size={collapsed ? 32 : 36} />
            </div>

            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-sm tracking-tight text-forest flex items-center gap-1.5 font-sans">
                  The Living Atlas
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-bright-yellow"></span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-mono text-muted-grey">
                  Visarjan Ghat Watch
                </span>
              </div>
            )}
          </Link>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-forest/70 hover:text-forest p-1.5 rounded-lg hover:bg-pale-green border border-gray-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-forest"
            title={collapsed ? 'Expand Atlas Rail' : 'Collapse Atlas Rail'}
            aria-label={collapsed ? 'Expand Atlas Rail' : 'Collapse Atlas Rail'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items (01 - 05) */}
        <nav className="flex-1 py-5 px-2.5 space-y-1.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-grey font-semibold">
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
                className={`group relative flex items-center rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-forest ${
                  collapsed ? 'justify-center p-3' : 'gap-3.5 px-3 py-3'
                } ${
                  active
                    ? 'bg-forest text-white font-semibold shadow-sm'
                    : 'text-forest hover:bg-pale-green hover:text-forest'
                }`}
                title={`${item.num} — ${item.label}: ${item.desc}`}
                aria-label={`${item.num} — ${item.label}`}
              >
                {/* Bright Yellow Active Indicator Bar */}
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-bright-yellow rounded-r-full shadow-[0_0_8px_#FFB900]" />
                )}

                {/* Number Badge (01 - 05) */}
                {!collapsed && (
                  <span
                    className={`font-mono text-xs px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                      active
                        ? 'bg-forest-deep text-bright-yellow font-bold'
                        : 'text-forest bg-light-grey border border-forest/15 font-semibold group-hover:bg-white'
                    }`}
                  >
                    {item.num}
                  </span>
                )}

                {/* Lucide Outline Icon */}
                <IconComponent
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    active ? 'text-white' : 'text-forest'
                  }`}
                />

                {/* Label & Description (expanded mode) */}
                {!collapsed && (
                  <div className="flex flex-col text-left truncate">
                    <span className="text-sm tracking-tight leading-tight truncate">
                      {item.label}
                    </span>
                    <span
                      className={`text-[10px] truncate ${
                        active ? 'text-white/80 font-normal' : 'text-muted-grey'
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
        <div
          className={`border-t border-gray-200 shrink-0 transition-all duration-300 ${
            collapsed ? 'p-2.5 flex flex-col items-center gap-2' : 'p-3.5 m-2.5 rounded-xl bg-light-grey/90 border border-gray-200'
          }`}
        >
          {collapsed ? (
            <div
              className="flex flex-col items-center gap-1.5 py-2"
              title={`${festival} immersion · ${summary ? summary.rows.toLocaleString() : '—'} MPPCB rows (2023-2025)`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-bright-yellow animate-pulse" />
              <Link
                to="/"
                className="p-1.5 rounded-lg text-forest hover:bg-pale-green transition-colors"
                title="Public Landing Page"
                aria-label="Public Landing Page"
              >
                <ArrowUpRight className="w-4 h-4 text-forest" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-bright-yellow animate-pulse shrink-0"></div>
                <div className="text-xs truncate flex-1">
                  <div className="font-semibold text-forest font-mono tracking-tight flex items-center justify-between">
                    <span>{festival} Visarjan</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-pale-green text-forest font-semibold">
                      Active
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-grey font-mono mt-0.5">
                    {summary ? summary.rows.toLocaleString() : '—'} rows · 2023-2025
                  </div>
                </div>
              </div>

              <Link
                to="/"
                className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white hover:bg-pale-green border border-forest/15 text-[11px] text-forest font-semibold transition-colors shadow-subtle"
              >
                <span>Public Landing Page</span>
                <ArrowUpRight className="w-3 h-3 text-forest" />
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Consistent White Theme with Forest Accents) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeMobileDrawer}
          />

          {/* Drawer Body */}
          <div className="relative w-72 max-w-full bg-white text-forest h-full flex flex-col shadow-2xl p-4 border-r border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <WaterRingLogo size={32} />
                <div>
                  <div className="font-bold text-sm text-forest font-sans">Visarjan Ghat Watch</div>
                  <div className="text-[10px] text-muted-grey font-mono">The Living Atlas</div>
                </div>
              </div>
              <button
                type="button"
                onClick={closeMobileDrawer}
                className="text-forest/70 hover:text-forest p-1.5 rounded-lg hover:bg-pale-green"
                aria-label="Close Mobile Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 space-y-1.5 overflow-y-auto">
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
                        ? 'bg-forest text-white font-semibold shadow-sm'
                        : 'text-forest hover:bg-pale-green'
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                        active ? 'bg-forest-deep text-bright-yellow' : 'bg-light-grey text-forest border border-forest/15'
                      }`}
                    >
                      {item.num}
                    </span>
                    <IconComponent className={`w-5 h-5 ${active ? 'text-white' : 'text-forest'}`} />
                    <span className="text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-gray-200 text-xs">
              <div className="font-mono text-forest font-semibold flex items-center justify-between">
                <span>{festival} Mode Active</span>
                <span className="w-2 h-2 rounded-full bg-bright-yellow"></span>
              </div>
              <div className="text-[11px] text-muted-grey mt-1 font-mono">MPPCB 2023–2025 Data Pack</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
