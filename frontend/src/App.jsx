import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { FestivalProvider } from './context/FestivalContext';
import WorkspaceLayout from './components/layout/WorkspaceLayout';
import LandingPage from './pages/LandingPage';
import OverviewPage from './pages/OverviewPage';
import RankingsPage from './pages/RankingsPage';
import GhatDetailPage from './pages/GhatDetailPage';
import OfficialBriefPage from './pages/OfficialBriefPage';
import MethodologyPage from './pages/MethodologyPage';

export default function App() {
  return (
    <FestivalProvider>
      <Routes>
        {/* Public Experience A: Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Experience B: The Living Atlas Workspace */}
        <Route path="/app" element={<WorkspaceLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="rankings" element={<RankingsPage />} />
          <Route path="ghat/:id" element={<GhatDetailPage />} />
          <Route path="ghat" element={<Navigate to="/app/ghat/khatlapura-ghat" replace />} />
          <Route path="brief" element={<OfficialBriefPage />} />
          <Route path="methodology" element={<MethodologyPage />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </FestivalProvider>
  );
}
