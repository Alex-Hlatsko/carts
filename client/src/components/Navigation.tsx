import * as React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Plus, List, FileText, Settings, QrCode } from 'lucide-react';

export function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/add-stand', icon: Plus, label: 'Добавить' },
    { path: '/stands', icon: List, label: 'Стенды' },
    { path: '/reports', icon: FileText, label: 'Отчёты' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">Учёт стендов</h1>
          </div>
          
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}