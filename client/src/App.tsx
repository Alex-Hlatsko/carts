import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ScannerPage } from '@/pages/ScannerPage';
import { MaterialsPage } from '@/pages/MaterialsPage';
import { StandsPage } from '@/pages/StandsPage';
import { AddStandPage } from '@/pages/AddStandPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { StandDetailsPage } from '@/pages/StandDetailsPage';
import { EditStandPage } from '@/pages/EditStandPage';
import { ReportDetailsPage } from '@/pages/ReportDetailsPage';
import { ServiceReportPage } from '@/pages/ServiceReportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/scanner" replace />} />
          <Route path="scanner" element={<ScannerPage />} />
          <Route path="materials" element={<MaterialsPage />} />
          <Route path="stands" element={<StandsPage />} />
          <Route path="stands/:id" element={<StandDetailsPage />} />
          <Route path="stands/:id/edit" element={<EditStandPage />} />
          <Route path="add-stand" element={<AddStandPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:id" element={<ReportDetailsPage />} />
          <Route path="reports/:id/service" element={<ServiceReportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
