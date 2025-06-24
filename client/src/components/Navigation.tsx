import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QrCode, Package, Monitor, Plus, Settings, FileText, Menu, X } from 'lucide-react';

export function Navigation() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { path: '/', icon: QrCode, label: 'Сканер' },
    { path: '/materials', icon: Package, label: 'Материалы' },
    { path: '/stands', icon: Monitor, label: 'Стенды' },
    { path: '/add-stand', icon: Plus, label: 'Добавить стенд' },
    { path: '/settings', icon: Settings, label: 'Настройки' },
    { path: '/reports', icon: FileText, label: 'Отчёты' }
  ];

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-lg md:text-xl font-bold">Система стендов</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  asChild
                >
                  <Link to={item.path}>
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="justify-start"
                  >
                    <Link to={item.path} onClick={handleLinkClick}>
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
