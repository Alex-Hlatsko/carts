import * as React from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scannerRef = React.useRef<QrScanner | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);

  const startScanning = React.useCallback(async () => {
    if (!videoRef.current) return;

    try {
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          onScan(result.data);
          stopScanning();
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      await scannerRef.current.start();
      setIsScanning(true);
    } catch (err: any) {
      onError('Не удалось запустить камеру: ' + err.message);
    }
  }, [onScan, onError]);

  const stopScanning = React.useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  React.useEffect(() => {
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <video
          ref={videoRef}
          className="w-full max-w-md mx-auto rounded-lg"
          style={{ display: isScanning ? 'block' : 'none' }}
        />
        
        {!isScanning && (
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Нажмите кнопку для запуска сканера QR-кодов
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {!isScanning ? (
            <Button onClick={startScanning}>
              Запустить сканер
            </Button>
          ) : (
            <Button variant="outline" onClick={stopScanning}>
              Остановить
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
