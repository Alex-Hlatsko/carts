import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ScanLine, 
  Package, 
  Monitor, 
  Plus, 
  Settings, 
  FileText 
} from 'lucide-react';

const navItems = [
  { path: '/scanner', label: 'Сканер', icon: ScanLine },
  { path: '/materials', label: 'Материалы', icon: Package },
  { path: '/stands', label: 'Стенды', icon: Monitor },
  { path: '/add-stand', label: 'Добавить', icon: Plus },
  { path: '/reports', label: 'Отчёты', icon: FileText },
  { path: '/settings', label: 'Настройки', icon: Settings },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:static md:border-t-0 md:border-r md:w-64 md:min-h-screen">
      <div className="flex md:flex-col p-2 md:p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} className="flex-1 md:flex-none">
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full h-12 md:h-10 flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-2',
                  'text-xs md:text-sm'
                )}
              >
                <Icon className="h-4 w-4 md:h-4 md:w-4" />
                <span className="md:inline">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
