import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleScan = () => {
    if (!videoRef.current || scanning) return;
    
    setScanning(true);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (context) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      // Simulate QR code detection (in real app, use a QR code library)
      const mockQRCode = `STAND_${Math.floor(Math.random() * 1000)}`;
      setTimeout(() => {
        onScan(mockQRCode);
        setScanning(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-black text-white">
        <Button variant="ghost" onClick={onClose} className="text-white">
          Назад
        </Button>
        <h2 className="text-lg font-semibold">Сканер QR кода</h2>
        <Button variant="ghost" onClick={switchCamera} className="text-white">
          <SwitchCamera className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg"></div>
        </div>
      </div>
      
      <div className="p-4 bg-black">
        <Button 
          onClick={handleScan} 
          disabled={scanning}
          className="w-full"
        >
          <Camera className="w-5 h-5 mr-2" />
          {scanning ? 'Сканирование...' : 'Сканировать'}
        </Button>
      </div>
    </div>
  );
}
