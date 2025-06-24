import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (err) {
      onError?.('Не удалось получить доступ к камере');
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const simulateQRScan = () => {
    // Симуляция сканирования для тестирования
    const testCode = 'STAND_' + Math.floor(Math.random() * 100);
    onScan(testCode);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">QR Сканер</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isScanning ? (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 object-cover rounded-md"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none">
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-md">
            <p className="text-center text-muted-foreground mb-4">
              Наведите камеру на QR код стенда
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              Начать сканирование
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="destructive" className="flex-1">
              Остановить
            </Button>
          )}
          <Button onClick={simulateQRScan} variant="outline">
            Тест
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground">
          После сканирования QR кода выберите действие: принять или выдать стенд
        </p>
      </CardContent>
    </Card>
  );
}
