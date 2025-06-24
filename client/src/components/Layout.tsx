import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { QrCode, Package, ClipboardList, Settings, FileText } from 'lucide-react';

export function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <main className="pb-20">
          <Outlet />
        </main>
        
        <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
          <div className="flex justify-around py-2">
            <Link
              to="/scanner"
              className={`flex flex-col items-center p-2 ${
                isActive('/scanner') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <QrCode size={20} />
              <span className="text-xs mt-1">Сканер</span>
            </Link>
            
            <Link
              to="/stands"
              className={`flex flex-col items-center p-2 ${
                isActive('/stands') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Package size={20} />
              <span className="text-xs mt-1">Стенды</span>
            </Link>
            
            <Link
              to="/materials"
              className={`flex flex-col items-center p-2 ${
                isActive('/materials') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <ClipboardList size={20} />
              <span className="text-xs mt-1">Материалы</span>
            </Link>
            
            <Link
              to="/reports"
              className={`flex flex-col items-center p-2 ${
                isActive('/reports') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <FileText size={20} />
              <span className="text-xs mt-1">Отчёты</span>
            </Link>
            
            <Link
              to="/settings"
              className={`flex flex-col items-center p-2 ${
                isActive('/settings') ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              <Settings size={20} />
              <span className="text-xs mt-1">Настройки</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
