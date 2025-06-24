import * as React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Scanner } from '../pages/Scanner';
import { Materials } from '../pages/Materials';
import { Stands } from '../pages/Stands';
import { AddStand } from '../pages/AddStand';
import { Settings } from '../pages/Settings';
import { Reports } from '../pages/Reports';

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/stands" element={<Stands />} />
          <Route path="/add-stand" element={<AddStand />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}
