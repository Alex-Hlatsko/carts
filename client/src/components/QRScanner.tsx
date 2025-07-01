import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameras, setCameras] = useState<QrScanner.Camera[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        if (!hasCamera) {
          setError('Камера не найдена на вашем устройстве');
          setIsLoading(false);
          return;
        }

        // Get available cameras
        const availableCameras = await QrScanner.listCameras();
        setCameras(availableCameras);

        // Create scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Code scanned:', result.data);
            onScan(result.data);
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: availableCameras[currentCameraIndex]?.id || 'environment'
          }
        );

        scannerRef.current = scanner;
        await scanner.start();
        setIsLoading(false);
      } catch (err) {
        console.error('Scanner initialization error:', err);
        setError('Не удалось запустить камеру. Проверьте разрешения.');
        setIsLoading(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [onScan, currentCameraIndex]);

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;

    try {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      setCurrentCameraIndex(nextIndex);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Сканер QR-кода
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-8">
              <p>Запуск камеры...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={onClose}>Закрыть</Button>
            </div>
          )}
          
          {!error && (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-lg bg-black"
                playsInline
                muted
              />
              {!isLoading && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-4 border-t-4 border-primary"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-4 border-t-4 border-primary"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-4 border-b-4 border-primary"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-4 border-b-4 border-primary"></div>
                </div>
              )}
            </div>
          )}
          
          {!error && !isLoading && (
            <div className="space-y-4 mt-4">
              <p className="text-center text-sm text-muted-foreground">
                Наведите камеру на QR-код стенда
              </p>
              
              {cameras.length > 1 && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchCamera}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Переключить камеру
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
