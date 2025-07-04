import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, ArrowLeft } from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';

export function ScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleScanResult = (result: string) => {
    console.log('ScanPage: QR scan result:', result);
    setShowScanner(false);
    // Navigate to stand detail page with the scanned QR code
    navigate(`/stand/${encodeURIComponent(result)}`);
  };

  const handleOpenScanner = () => {
    console.log('ScanPage: Opening scanner');
    setShowScanner(true);
  };

  const handleCloseScanner = () => {
    console.log('ScanPage: Closing scanner');
    setShowScanner(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto space-y-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <div className="text-center flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Сканер QR-кодов</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Отсканируйте код стенда
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="w-5 h-5" />
            Сканирование камерой
          </CardTitle>
          <CardDescription className="text-sm">
            Используйте камеру для сканирования QR-кода стенда
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenScanner} className="w-full" size="lg">
            <Camera className="w-4 h-4 mr-2" />
            Открыть камеру
          </Button>
        </CardContent>
      </Card>

      <div className="bg-muted p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Инструкция:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
          <li>Нажмите "Открыть камеру"</li>
          <li>Разрешите доступ к камере в браузере</li>
          <li>Наведите камеру на QR-код стенда</li>
          <li>Дождитесь автоматического распознавания</li>
          <li>Если камера не работает, используйте ручной ввод</li>
        </ol>
      </div>

      {showScanner && (
        <QRScanner onScan={handleScanResult} onClose={handleCloseScanner} />
      )}
    </div>
  );
}
