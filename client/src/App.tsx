import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { AddStandPage } from '@/pages/AddStandPage';
import { StandsPage } from '@/pages/StandsPage';
import { StandDetailsPage } from '@/pages/StandDetailsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add-stand" element={<AddStandPage />} />
        <Route path="/stands" element={<StandsPage />} />
        <Route path="/stand/:id" element={<StandDetailsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Router>
  );
}

export default App;