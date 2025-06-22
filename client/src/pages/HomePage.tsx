import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRScanner } from '@/components/QRScanner';
import { QrCode, Plus, List, Settings, Download, Upload } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result);
    // Navigate to stand details or action page
    navigate(`/stand/${result}`);
  };

  const menuItems = [
    {
      title: 'Сканировать QR-код',
      description: 'Сканировать стенд для выдачи или приёма',
      icon: QrCode,
      onClick: () => setShowScanner(true),
      color: 'bg-blue-500'
    },
    {
      title: 'Добавить стенд',
      description: 'Добавить новый стенд в систему',
      icon: Plus,
      onClick: () => navigate('/add-stand'),
      color: 'bg-green-500'
    },
    {
      title: 'Все стенды',
      description: 'Просмотр всех стендов',
      icon: List,
      onClick: () => navigate('/stands'),
      color: 'bg-purple-500'
    },
    {
      title: 'Отчёты',
      description: 'Просмотр и экспорт отчётов',
      icon: Download,
      onClick: () => navigate('/reports'),
      color: 'bg-orange-500'
    },
    {
      title: 'Настройки',
      description: 'Редактировать чек-листы',
      icon: Settings,
      onClick: () => navigate('/settings'),
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Учёт стендов
          </h1>
          <p className="text-gray-600">
            Система управления стендами с литературой
          </p>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6" onClick={item.onClick}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <QRScanner
          isOpen={showScanner}
          onScan={handleQRScan}
          onClose={() => setShowScanner(false)}
        />
      </div>
    </div>
  );
}