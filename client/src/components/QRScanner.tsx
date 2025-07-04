import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, X, RotateCcw, AlertCircle } from 'lucide-react';

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
    let mounted = true;

    const initScanner = async () => {
      if (!videoRef.current || !mounted) return;

      try {
        setIsLoading(true);
        setError(null);
        console.log('QR Scanner: Initializing...');

        // Check if camera is available
        const hasCamera = await QrScanner.hasCamera();
        console.log('QR Scanner: Camera available:', hasCamera);
        
        if (!hasCamera) {
          if (mounted) {
            setError('Камера не найдена на вашем устройстве');
            setIsLoading(false);
          }
          return;
        }

        // Get available cameras
        const availableCameras = await QrScanner.listCameras(true);
        console.log('QR Scanner: Available cameras:', availableCameras);
        
        if (mounted) {
          setCameras(availableCameras);
        }

        if (availableCameras.length === 0) {
          if (mounted) {
            setError('Камеры не найдены');
            setIsLoading(false);
          }
          return;
        }

        // Select camera with preference for back camera
        let preferredCamera = availableCameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        );
        
        if (!preferredCamera) {
          preferredCamera = availableCameras[currentCameraIndex] || availableCameras[0];
        }

        console.log('QR Scanner: Using camera:', preferredCamera.label);

        // Create scanner instance
        const scanner = new QrScanner(
          videoRef.current,
          (result) => {
            console.log('QR Scanner: Code scanned:', result.data);
            if (mounted) {
              onScan(result.data);
            }
          },
          {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,
            preferredCamera: preferredCamera?.id || 'environment',
            maxScansPerSecond: 3
          }
        );

        if (mounted) {
          scannerRef.current = scanner;
          console.log('QR Scanner: Starting scanner...');
          await scanner.start();
          console.log('QR Scanner: Scanner started successfully');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('QR Scanner initialization error:', err);
        
        if (mounted) {
          let errorMessage = 'Не удалось запустить камеру.';
          if (err instanceof Error) {
            if (err.message.includes('Permission denied') || err.message.includes('NotAllowedError')) {
              errorMessage = 'Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере в настройках браузера.';
            } else if (err.message.includes('not found') || err.message.includes('NotFoundError')) {
              errorMessage = 'Камера не найдена на вашем устройстве.';
            } else if (err.message.includes('in use') || err.message.includes('NotReadableError')) {
              errorMessage = 'Камера уже используется другим приложением.';
            }
          }
          setError(errorMessage);
          setIsLoading(false);
        }
      }
    };

    // Add a small delay to ensure the component is mounted
    const timeoutId = setTimeout(initScanner, 100);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        try {
          scannerRef.current.stop();
          scannerRef.current.destroy();
        } catch (err) {
          console.error('Error cleaning up scanner:', err);
        }
        scannerRef.current = null;
      }
    };
  }, [onScan, currentCameraIndex]);

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;

    try {
      const nextIndex = (currentCameraIndex + 1) % cameras.length;
      console.log('QR Scanner: Switching to camera', nextIndex, cameras[nextIndex]?.label);
      
      // Stop current scanner
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
      }
      
      setCurrentCameraIndex(nextIndex);
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  const handleRetry = () => {
    console.log('QR Scanner: Retrying initialization...');
    setError(null);
    setIsLoading(true);
    setCurrentCameraIndex(0);
  };

  const handleManualInput = () => {
    const qrCode = prompt('Введите QR-код стенда вручную:');
    if (qrCode && qrCode.trim()) {
      onScan(qrCode.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-md mx-2">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Сканер QR-кода
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Запуск камеры...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive mb-4 text-sm">{error}</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button onClick={handleRetry} size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
                <Button onClick={handleManualInput} variant="outline" size="sm">
                  Ввести вручную
                </Button>
                <Button onClick={onClose} variant="outline" size="sm">
                  Закрыть
                </Button>
              </div>
            </div>
          )}
          
          {!error && !isLoading && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded-lg bg-black"
                  playsInline
                  muted
                  autoPlay
                />
                <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary"></div>
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Наведите камеру на QR-код стенда
              </p>
              
              <div className="flex justify-center gap-2 flex-wrap">
                {cameras.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchCamera}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Переключить
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualInput}
                >
                  Ввести вручную
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Закрыть
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
