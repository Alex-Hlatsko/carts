import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { Toast } from '@/components/ui/toast';
import { useToast } from '@/hooks/useToast';
import { ScannerPage } from '@/pages/ScannerPage';
import { MaterialsPage } from '@/pages/MaterialsPage';
import { StandsPage } from '@/pages/StandsPage';
import { AddStandPage } from '@/pages/AddStandPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col md:flex-row">
          <Navigation />
          
          <main className="flex-1 pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Navigate to="/scanner" replace />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/materials" element={<MaterialsPage />} />
              <Route path="/stands" element={<StandsPage />} />
              <Route path="/add-stand" element={<AddStandPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>

        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </Router>
  );
}

export default App;
