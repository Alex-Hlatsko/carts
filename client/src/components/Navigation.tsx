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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-bold text-xl">
            Учет стендов
          </Link>
          
          <div className="flex gap-2">
            <Button
              asChild
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Главная
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/scan') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/scan">
                <Scan className="w-4 h-4 mr-2" />
                Сканер
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/stands') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/stands">
                <Package className="w-4 h-4 mr-2" />
                Стенды
              </Link>
            </Button>
            
            <Button
              asChild
              variant={isActive('/reports') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/reports">
                <FileText className="w-4 h-4 mr-2" />
                Отчеты
              </Link>
            </Button>

            <Button
              asChild
              variant={isActive('/settings') ? 'default' : 'ghost'}
              size="sm"
            >
              <Link to="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Настройки
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
