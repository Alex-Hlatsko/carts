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
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-3 gap-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-1 h-16 text-xs"
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
