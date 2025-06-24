import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { TodoPage } from '@/pages/TodoPage';
import { QRPage } from '@/pages/QRPage';
import { Navigation } from '@/components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/todos" element={<TodoPage />} />
            <Route path="/qr" element={<QRPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;