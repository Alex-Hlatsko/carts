import * as React from 'react';
import { Camera, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerProps {
  onScan: (result: string) => void;
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('environment');

  const startScanning = () => {
    setIsScanning(true);
    // Симуляция сканирования для демонстрации
    setTimeout(() => {
      onScan('STAND-001');
      setIsScanning(false);
    }, 2000);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[300px] flex flex-col items-center justify-center">
        {isScanning ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <Camera className="h-16 w-16 text-primary mx-auto" />
            </div>
            <p className="text-gray-600">Сканирование...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Camera className="h-16 w-16 text-gray-400 mx-auto" />
            <p className="text-gray-600">Направьте камеру на QR-код стенда</p>
            <Button onClick={startScanning} className="w-full">
              Начать сканирование
            </Button>
          </div>
        )}
      </div>
      
      {isScanning && (
        <Button
          variant="outline"
          onClick={toggleCamera}
          className="w-full"
        >
          <SwitchCamera className="h-4 w-4 mr-2" />
          Переключить камеру ({facingMode === 'user' ? 'Передняя' : 'Задняя'})
        </Button>
      )}
    </div>
  );
}
