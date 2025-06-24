import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { QrCode, Package, Monitor, Plus, Settings, FileText } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Сканер', icon: QrCode },
    { path: '/materials', label: 'Материалы', icon: Package },
    { path: '/stands', label: 'Стенды', icon: Monitor },
    { path: '/add-stand', label: 'Добавить', icon: Plus },
    { path: '/settings', label: 'Настройки', icon: Settings },
    { path: '/reports', label: 'Отчёты', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                location.pathname === path
                  ? 'text-primary bg-primary/10'
                  : 'text-gray-600 hover:text-primary'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
