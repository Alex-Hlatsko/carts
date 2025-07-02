import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';

export function ScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleScanResult = (result: string) => {
    setShowScanner(false);
    navigate(`/stand/${encodeURIComponent(result)}`);
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 px-4">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Сканер QR-кодов</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Отсканируйте код стенда
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5" />
            Сканирование камерой
          </CardTitle>
          <CardDescription className="text-sm">
            Используйте камеру для сканирования QR-кода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenScanner} className="w-full" size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Открыть камеру
          </Button>
        </CardContent>
      </Card>

      {showScanner && (
        <QRScanner onScan={handleScanResult} onClose={handleCloseScanner} />
      )}
    </div>
  );
}
