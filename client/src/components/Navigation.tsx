import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Package, Scan, FileText, Settings } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link to="/" className="font-bold text-lg sm:text-xl truncate">
            Учет стендов
          </Link>
          
          <div className="flex gap-1 sm:gap-2">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3"
            >
              <Link to="/">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Главная</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/scan') ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3"
            >
              <Link to="/scan">
                <Scan className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Сканер</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/stands') ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3"
            >
              <Link to="/stands">
                <Package className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Стенды</span>
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/reports') ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3"
            >
              <Link to="/reports">
                <FileText className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Отчеты</span>
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive('/settings') ? 'default' : 'ghost'}
              size="sm"
              className="px-2 sm:px-3"
            >
              <Link to="/settings">
                <Settings className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Настройки</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
