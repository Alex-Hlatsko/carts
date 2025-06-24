import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, CheckSquare, QrCode } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center space-x-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Мое приложение</h1>
          </div>
          <div className="flex space-x-2 ml-8">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Главная
              </Link>
            </Button>
            <Button
              variant={isActive('/todos') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/todos">
                <CheckSquare className="h-4 w-4 mr-2" />
                Задачи
              </Link>
            </Button>
            <Button
              variant={isActive('/qr') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/qr">
                <QrCode className="h-4 w-4 mr-2" />
                QR код
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}