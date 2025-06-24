import * as React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-2 py-4 max-w-md">
        {children}
        <Navigation />
      </div>
    </div>
  );
}
