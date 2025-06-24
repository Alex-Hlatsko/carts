import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  QrCode, 
  Package, 
  Monitor, 
  Plus, 
  FileText, 
  Settings 
} from 'lucide-react';

const navigation = [
  { name: 'Сканер', href: '/', icon: QrCode },
  { name: 'Материалы', href: '/materials', icon: Package },
  { name: 'Стенды', href: '/stands', icon: Monitor },
  { name: 'Добавить стенд', href: '/add-stand', icon: Plus },
  { name: 'Отчёты', href: '/reports', icon: FileText },
  { name: 'Настройки', href: '/settings', icon: Settings },
];

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
      <div className="grid grid-cols-3 sm:grid-cols-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground'
                )
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
