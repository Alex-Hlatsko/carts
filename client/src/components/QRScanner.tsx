import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { SwitchCamera, X } from 'lucide-react';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const codeReader = useRef<BrowserMultiFormatReader>();

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    const getDevices = async () => {
      try {
        const videoDevices = await codeReader.current!.listVideoInputDevices();
        setDevices(videoDevices);
        
        // Предпочтительно выбираем заднюю камеру
        const backCamera = videoDevices.findIndex(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera !== -1) {
          setCurrentDeviceIndex(backCamera);
        }
      } catch (err) {
        console.error('Error getting devices:', err);
      }
    };

    getDevices();

    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  useEffect(() => {
    if (devices.length > 0 && !isScanning) {
      startScanning();
    }
  }, [devices, currentDeviceIndex]);

  const startScanning = async () => {
    if (!videoRef.current || !codeReader.current || devices.length === 0) return;

    setIsScanning(true);
    
    try {
      const selectedDevice = devices[currentDeviceIndex];
      
      codeReader.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) {
            onScan(result.getText());
          }
        }
      );
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
    }
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      codeReader.current?.reset();
      setIsScanning(false);
      setCurrentDeviceIndex((prev) => (prev + 1) % devices.length);
    }
  };

  const handleClose = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50"></div>
        </div>
        
        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Button variant="outline" size="icon" onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
          
          {devices.length > 1 && (
            <Button variant="outline" size="icon" onClick={switchCamera}>
              <SwitchCamera className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-white text-center">
            Наведите камеру на QR-код стенда
          </p>
        </div>
      </div>
    </div>
  );
}
