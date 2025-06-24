import * as React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, QrCode, Package, Monitor, Plus, Settings, FileText } from 'lucide-react';

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { path: '/scanner', label: 'Сканер', icon: QrCode },
    { path: '/materials', label: 'Материалы', icon: Package },
    { path: '/stands', label: 'Стенды', icon: Monitor },
    { path: '/add-stand', label: 'Добавить', icon: Plus },
    { path: '/settings', label: 'Настройки', icon: Settings },
    { path: '/reports', label: 'Отчёты', icon: FileText },
  ];

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const showBackButton = !tabs.some(tab => tab.path === location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between">
          {showBackButton ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="text-primary-foreground hover:bg-primary/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          ) : (
            <div></div>
          )}
          <h1 className="text-lg font-semibold">Управление стендами</h1>
          <div></div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <Outlet />
      </main>

      <nav className="bg-card border-t p-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <Button
                key={tab.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTabClick(tab.path)}
                className={`flex flex-col items-center p-2 h-auto ${
                  isActive ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs mt-1">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
