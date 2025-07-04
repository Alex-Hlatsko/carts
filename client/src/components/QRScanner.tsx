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
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    initializeScanner();

    return () => {
      mountedRef.current = false;
      cleanupScanner();
    };
  }, [currentCameraIndex]);

  const cleanupScanner = () => {
    if (scannerRef.current) {
      try {
        console.log('QR Scanner: Cleaning up scanner...');
        scannerRef.current.stop();
        scannerRef.current.destroy();
        scannerRef.current = null;
        console.log('QR Scanner: Scanner cleaned up');
      } catch (err) {
        console.error('QR Scanner: Error during cleanup:', err);
      }
    }
  };

  const initializeScanner = async () => {
    if (!videoRef.current || !mountedRef.current) {
      console.log('QR Scanner: Video ref not available or component unmounted');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('QR Scanner: Starting initialization...');

      // Clean up existing scanner
      cleanupScanner();

      // Check camera availability
      const hasCamera = await QrScanner.hasCamera();
      console.log('QR Scanner: Camera available:', hasCamera);
      
      if (!hasCamera) {
        if (mountedRef.current) {
          setError('Камера не найдена на вашем устройстве');
          setIsLoading(false);
        }
        return;
      }

      // Get available cameras
      const availableCameras = await QrScanner.listCameras(true);
      console.log('QR Scanner: Available cameras:', availableCameras);
      
      if (mountedRef.current) {
        setCameras(availableCameras);
      }

      if (availableCameras.length === 0) {
        if (mountedRef.current) {
          setError('Камеры не найдены');
          setIsLoading(false);
        }
        return;
      }

      // Select camera
      let selectedCamera = availableCameras[currentCameraIndex];
      if (!selectedCamera) {
        // Prefer back camera if available
        selectedCamera = availableCameras.find(camera => 
          camera.label.toLowerCase().includes('back') || 
          camera.label.toLowerCase().includes('rear') ||
          camera.label.toLowerCase().includes('environment')
        ) || availableCameras[0];
      }

      console.log('QR Scanner: Using camera:', selectedCamera?.label || 'Default');

      // Create and configure scanner
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Scanner: Code detected:', result.data);
          if (mountedRef.current) {
            onScan(result.data);
          }
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: selectedCamera?.id || 'environment',
          maxScansPerSecond: 5,
          calculateScanRegion: (video) => {
            const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
            const scanRegionSize = Math.round(0.7 * smallerDimension);
            return {
              x: Math.round((video.videoWidth - scanRegionSize) / 2),
              y: Math.round((video.videoHeight - scanRegionSize) / 2),
              width: scanRegionSize,
              height: scanRegionSize,
            };
          }
        }
      );

      if (!mountedRef.current) {
        scanner.destroy();
        return;
      }

      scannerRef.current = scanner;
      console.log('QR Scanner: Starting camera...');
      
      await scanner.start();
      
      if (mountedRef.current) {
        console.log('QR Scanner: Camera started successfully');
        setIsLoading(false);
      } else {
        scanner.destroy();
      }

    } catch (err) {
      console.error('QR Scanner: Initialization error:', err);
      
      if (mountedRef.current) {
        let errorMessage = 'Не удалось запустить камеру.';
        
        if (err instanceof Error) {
          const errorMsg = err.message.toLowerCase();
          if (errorMsg.includes('permission') || errorMsg.includes('notallowederror')) {
            errorMessage = 'Доступ к камере запрещен. Пожалуйста, разрешите доступ к камере в настройках браузера.';
          } else if (errorMsg.includes('notfound') || errorMsg.includes('notfounderror')) {
            errorMessage = 'Камера не найдена на вашем устройстве.';
          } else if (errorMsg.includes('notreadable') || errorMsg.includes('notreadableerror')) {
            errorMessage = 'Камера используется другим приложением.';
          } else if (errorMsg.includes('overconstrained') || errorMsg.includes('overconstrainederror')) {
            errorMessage = 'Камера не поддерживает требуемые параметры.';
          }
        }
        
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    console.log('QR Scanner: Switching to camera index:', nextIndex);
    setCurrentCameraIndex(nextIndex);
  };

  const handleRetry = () => {
    console.log('QR Scanner: Retrying initialization...');
    setError(null);
    setCurrentCameraIndex(0);
    initializeScanner();
  };

  const handleManualInput = () => {
    const qrCode = prompt('Введите ID стенда вручную:');
    if (qrCode && qrCode.trim()) {
      console.log('QR Scanner: Manual input:', qrCode.trim());
      onScan(qrCode.trim());
    }
  };

  const handleClose = () => {
    console.log('QR Scanner: Closing scanner...');
    cleanupScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Сканер QR-кода
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm">Запуск камеры...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-6">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <p className="text-destructive mb-4 text-sm leading-relaxed">{error}</p>
              <div className="flex flex-col gap-2">
                <Button onClick={handleRetry} size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Попробовать снова
                </Button>
                <Button onClick={handleManualInput} variant="outline" size="sm">
                  Ввести вручную
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
                <div className="absolute inset-4 border-2 border-primary rounded-lg pointer-events-none opacity-50">
                  <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-primary"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-primary"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-primary"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-primary"></div>
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Наведите камеру на QR-код стенда
              </p>
              
              <div className="flex flex-col gap-2">
                {cameras.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwitchCamera}
                    className="w-full"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Переключить камеру ({currentCameraIndex + 1}/{cameras.length})
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleManualInput}
                  className="w-full"
                >
                  Ввести ID вручную
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
