import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QRScanner } from '@/components/QRScanner';
import { QrCode, Plus, List, Download, BookOpen } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (result: string) => {
    console.log('QR Code scanned:', result);
    navigate(`/stand/${result}`);
  };

  const menuItems = [
    {
      title: 'Сканировать QR-код',
      description: 'Сканировать стенд для выдачи или приёма',
      icon: QrCode,
      onClick: () => setShowScanner(true),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: 'Добавить стенд',
      description: 'Добавить новый стенд в систему',
      icon: Plus,
      onClick: () => navigate('/add-stand'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: 'Все стенды',
      description: 'Просмотр всех стендов',
      icon: List,
      onClick: () => navigate('/stands'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: 'Материалы',
      description: 'Управление литературой и материалами',
      icon: BookOpen,
      onClick: () => navigate('/materials'),
      color: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      title: 'Отчёты',
      description: 'Просмотр и экспорт отчётов',
      icon: Download,
      onClick: () => navigate('/reports'),
      color: 'bg-orange-600 hover:bg-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Добро пожаловать
          </h1>
          <p className="text-muted-foreground">
            Система управления стендами с литературой
          </p>
        </div>

        <div className="grid gap-4">
          {menuItems.map((item, index) => (
            <Card key={index} className="cursor-pointer hover:bg-accent transition-colors">
              <CardContent className="p-6" onClick={item.onClick}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
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