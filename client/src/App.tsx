import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Scanner } from '@/pages/Scanner';
import { Materials } from '@/pages/Materials';
import { Stands } from '@/pages/Stands';
import { AddStand } from '@/pages/AddStand';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <Router>
      <div className="min-h-screen pb-16">
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/add-stand" element={<AddStand />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
