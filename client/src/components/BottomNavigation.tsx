import { Button } from '@/components/ui/button';
import { Camera, Package, Settings, FileText, Plus, Scan } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/scanner', icon: Scan, label: 'Сканер' },
    { path: '/materials', icon: Package, label: 'Материалы' },
    { path: '/stands', icon: FileText, label: 'Стенды' },
    { path: '/add-stand', icon: Plus, label: 'Добавить' },
    { path: '/reports', icon: FileText, label: 'Отчёты' },
    { path: '/settings', icon: Settings, label: 'Настройки' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 h-14 text-xs px-2"
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs leading-tight">{item.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-1 px-2 pb-2">
          {navItems.slice(3).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 h-14 text-xs px-2"
              >
                <Icon className="h-3 w-3" />
                <span className="text-xs leading-tight">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
