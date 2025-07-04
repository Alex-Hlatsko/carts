import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/pages/HomePage';
import { AddStandPage } from '@/pages/AddStandPage';
import { StandsPage } from '@/pages/StandsPage';
import { StandDetailsPage } from '@/pages/StandDetailsPage';
import { MaterialsPage } from '@/pages/MaterialsPage';
import { ReportsPage } from '@/pages/ReportsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-stand" element={<AddStandPage />} />
          <Route path="/stands" element={<StandsPage />} />
          <Route path="/stand/:id" element={<StandDetailsPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;