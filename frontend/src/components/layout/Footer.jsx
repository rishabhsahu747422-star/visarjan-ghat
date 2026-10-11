import React from 'react';
import { useFestival } from '../../context/FestivalContext';
import { Link } from 'react-router-dom';
import WaterRingLogo from '../ui/WaterRingLogo';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { summary } = useFestival();
  return (
    <footer className="bg-charcoal text-white pt-16 pb-12 border-t border-forest/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-bright-yellow">
                <WaterRingLogo size={34} animated={false} />
              </div>
              <div>
                <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Visarjan Ghat Watch
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-forest text-bright-yellow">
                    Living Atlas
                  </span>
                </div>
                <div className="text-xs text-muted-grey font-mono">Bhopal Environmental Intelligence</div>
              </div>
            </div>
            <p className="text-sm text-gray-300 max-w-md leading-relaxed">
              An open environmental intelligence platform examining historical water-quality observations across idol-immersion ghats in Bhopal, Madhya Pradesh. Designed for empirical civic decision-making and lake conservation.
            </p>
            <div className="flex items-center gap-2 text-xs text-bright-yellow font-mono">
              <span className="w-2 h-2 rounded-full bg-bright-yellow animate-ping"></span>
              <span>{summary ? summary.rows.toLocaleString() : '—'} readings loaded (2023-2025)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-grey">Workspace Access</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/app" className="hover:text-bright-yellow transition-colors flex items-center gap-1.5">
                  <span className="font-mono text-xs text-forest-light text-[#88B090]">01</span> Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/rankings" className="hover:text-bright-yellow transition-colors flex items-center gap-1.5">
                  <span className="font-mono text-xs text-forest-light text-[#88B090]">02</span> Ghat Rankings
                </Link>
              </li>
              <li>
                <Link to="/app/ghat/khatlapura-ghat" className="hover:text-bright-yellow transition-colors flex items-center gap-1.5">
                  <span className="font-mono text-xs text-forest-light text-[#88B090]">03</span> Ghat Detail Explorer
                </Link>
              </li>
              <li>
                <Link to="/app/brief" className="hover:text-bright-yellow transition-colors flex items-center gap-1.5">
                  <span className="font-mono text-xs text-forest-light text-[#88B090]">04</span> Official Brief
                </Link>
              </li>
              <li>
                <Link to="/app/methodology" className="hover:text-bright-yellow transition-colors flex items-center gap-1.5">
                  <span className="font-mono text-xs text-forest-light text-[#88B090]">05</span> Data & Methodology
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Standards & Disclaimers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted-grey">Standards & Sources</h4>
            <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
              <p>
                Evaluated against <strong className="text-white">CPCB Class B</strong> (Outdoor Bathing) standards: Dissolved Oxygen ≥ 5.0 mg/l, BOD ≤ 3.0 mg/l, pH 6.5–8.5.
              </p>
              <p>
                Source reports: Madhya Pradesh Pollution Control Board (MPPCB) Ganesh & Durga Immersion Reports (2023–2025).
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-grey gap-4">
          <div>
            © 2026 Visarjan Ghat Watch. Analytical results depend on the availability and quality of historical observations. Not a medical health certification or predictive simulation.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/app/methodology" className="hover:text-white underline underline-offset-4">
              Data Gaps & Limitations
            </Link>
            <span className="text-white/20">|</span>
            <span>Bhopal, Madhya Pradesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
