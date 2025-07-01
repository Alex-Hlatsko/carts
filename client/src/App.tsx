import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/pages/HomePage';
import { StandsPage } from '@/pages/StandsPage';
import { ScanPage } from '@/pages/ScanPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { StandDetailPage } from '@/pages/StandDetailPage';
import { ChecklistSettingsPage } from '@/pages/ChecklistSettingsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/stands" element={<StandsPage />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/stand/:qrCode" element={<StandDetailPage />} />
            <Route path="/checklist-settings" element={<ChecklistSettingsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
