import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SwitchCamera } from 'lucide-react';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useEffect(() => {
    const startScanner = async () => {
      if (!videoRef.current) return;

      try {
        // Stop existing scanner if any
        if (qrScannerRef.current) {
          qrScannerRef.current.destroy();
        }

        const qrScanner = new QrScanner(
          videoRef.current,
          (result) => {
            if (result?.data) {
              onScan(result.data);
            }
          },
          {
            preferredCamera: facingMode,
            highlightScanRegion: true,
            highlightCodeOutline: true,
          }
        );

        qrScannerRef.current = qrScanner;
        
        await qrScanner.start();
        
        // Check if flash is available
        const hasFlashSupport = await qrScanner.hasFlash();
        setHasFlash(hasFlashSupport);

      } catch (err) {
        console.error('Error starting QR scanner:', err);
      }
    };

    startScanner();

    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
    };
  }, [facingMode, onScan]);

  const switchCamera = async () => {
    if (qrScannerRef.current) {
      const cameras = await QrScanner.listCameras(true);
      if (cameras.length > 1) {
        const currentCamera = await qrScannerRef.current.getCamera();
        const newCamera = cameras.find(camera => camera.id !== currentCamera?.id);
        if (newCamera) {
          await qrScannerRef.current.setCamera(newCamera.id);
          setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
        }
      }
    }
  };

  const toggleFlash = async () => {
    if (qrScannerRef.current && hasFlash) {
      try {
        if (flashOn) {
          await qrScannerRef.current.turnFlashOff();
        } else {
          await qrScannerRef.current.turnFlashOn();
        }
        setFlashOn(!flashOn);
      } catch (err) {
        console.error('Error toggling flash:', err);
      }
    }
  };

  const handleClose = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <Button variant="ghost" onClick={handleClose} className="text-white">
          Назад
        </Button>
        <h2 className="text-lg font-semibold">Сканер QR кода</h2>
        <div className="flex space-x-2">
          {hasFlash && (
            <Button 
              variant="ghost" 
              onClick={toggleFlash} 
              className={`text-white ${flashOn ? 'bg-yellow-600' : ''}`}
            >
              💡
            </Button>
          )}
          <Button variant="ghost" onClick={switchCamera} className="text-white">
            <SwitchCamera className="w-5 h-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg bg-transparent">
            <div className="w-full h-full border-2 border-dashed border-white/50 rounded-lg"></div>
          </div>
        </div>
        
        <div className="absolute bottom-20 left-0 right-0 text-center text-white">
          <p className="text-lg font-semibold">Наведите камеру на QR код</p>
          <p className="text-sm opacity-75">Сканирование происходит автоматически</p>
        </div>
      </div>
    </div>
  );
}
