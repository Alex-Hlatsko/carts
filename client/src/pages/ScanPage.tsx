import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Camera } from 'lucide-react';
import { QRScanner } from '@/components/QRScanner';

export function ScanPage() {
  const [manualCode, setManualCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      navigate(`/stand/${encodeURIComponent(manualCode.trim())}`);
    }
  };

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
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Сканер QR-кодов</h1>
        <p className="text-muted-foreground">
          Отсканируйте или введите код стенда
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Сканирование камерой
          </CardTitle>
          <CardDescription>
            Используйте камеру для сканирования QR-кода
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenScanner} className="w-full">
            <Camera className="w-4 h-4 mr-2" />
            Открыть камеру
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Ручной ввод
          </CardTitle>
          <CardDescription>
            Введите код стенда вручную
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <Label htmlFor="manual-code">Код стенда</Label>
              <Input
                id="manual-code"
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Введите код стенда"
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full" disabled={!manualCode.trim()}>
              Найти стенд
            </Button>
          </form>
        </CardContent>
      </Card>

      {showScanner && (
        <QRScanner onScan={handleScanResult} onClose={handleCloseScanner} />
      )}
    </div>
  );
}
