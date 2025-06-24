import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Scanner } from '@/pages/Scanner';
import { Stands } from '@/pages/Stands';
import { AddStand } from '@/pages/AddStand';
import { EditStand } from '@/pages/EditStand';
import { StandDetail } from '@/pages/StandDetail';
import { ReceiveStand } from '@/pages/ReceiveStand';
import { GiveOutStand } from '@/pages/GiveOutStand';
import { Materials } from '@/pages/Materials';
import { Reports } from '@/pages/Reports';
import { ReportDetail } from '@/pages/ReportDetail';
import { ServiceReport } from '@/pages/ServiceReport';
import { Settings } from '@/pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/scanner" replace />} />
          <Route path="scanner" element={<Scanner />} />
          <Route path="stands" element={<Stands />} />
          <Route path="add-stand" element={<AddStand />} />
          <Route path="edit-stand/:id" element={<EditStand />} />
          <Route path="stand/:id" element={<StandDetail />} />
          <Route path="receive/:standId" element={<ReceiveStand />} />
          <Route path="give-out/:standId" element={<GiveOutStand />} />
          <Route path="materials" element={<Materials />} />
          <Route path="reports" element={<Reports />} />
          <Route path="report/:id" element={<ReportDetail />} />
          <Route path="service-report/:id" element={<ServiceReport />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
