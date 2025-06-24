import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Scanner } from '@/pages/scanner/Scanner';
import { Materials } from '@/pages/materials/Materials';
import { Stands } from '@/pages/stands/Stands';
import { AddStand } from '@/pages/add-stand/AddStand';
import { Settings } from '@/pages/settings/Settings';
import { Reports } from '@/pages/reports/Reports';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/add-stand" element={<AddStand />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
