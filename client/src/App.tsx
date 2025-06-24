import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Scanner } from '@/pages/Scanner';
import { Materials } from '@/pages/Materials';
import { Stands } from '@/pages/Stands';
import { AddStand } from '@/pages/AddStand';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';
import { StandDetail } from '@/pages/StandDetail';
import { StandEdit } from '@/pages/StandEdit';
import { Checklist } from '@/pages/Checklist';
import { IssueStand } from '@/pages/IssueStand';
import { ReportDetail } from '@/pages/ReportDetail';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/scanner" replace />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/stands/:id" element={<StandDetail />} />
          <Route path="/stands/:id/edit" element={<StandEdit />} />
          <Route path="/add-stand" element={<AddStand />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/checklist/:standCode" element={<Checklist />} />
          <Route path="/issue/:standCode" element={<IssueStand />} />
        </Routes>
        <BottomNavigation />
      </div>
    </Router>
  );
}

export default App;
