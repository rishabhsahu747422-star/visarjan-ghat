import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AtlasRail from './AtlasRail';

export default function WorkspaceLayout() {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-light-grey flex text-charcoal">
      {/* Atlas Rail (Sidebar) */}
      <AtlasRail
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        isMobileOpen={mobileDrawerOpen}
        closeMobileDrawer={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Area: dynamically expands when sidebar collapses */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-1 flex flex-col min-w-0"
          >
            <Outlet context={{ onOpenMobileMenu: () => setMobileDrawerOpen(true) }} />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
