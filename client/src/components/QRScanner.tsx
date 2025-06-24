import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Camera, SwitchCamera } from 'lucide-react';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');
  const [reader, setReader] = useState<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    setReader(codeReader);

    const getDevices = async () => {
      try {
        const videoDevices = await codeReader.listVideoInputDevices();
        setDevices(videoDevices);
        
        // Find back camera (environment facing)
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        if (backCamera) {
          setCurrentDeviceId(backCamera.deviceId);
        } else if (videoDevices.length > 0) {
          setCurrentDeviceId(videoDevices[0].deviceId);
        }
      } catch (err) {
        onError?.('Не удалось получить доступ к камере');
      }
    };

    getDevices();

    return () => {
      codeReader.reset();
    };
  }, [onError]);

  const startScanning = async () => {
    if (!reader || !videoRef.current) return;

    try {
      setIsScanning(true);
      
      const result = await reader.decodeOnceFromVideoDevice(
        currentDeviceId || undefined,
        videoRef.current
      );
      
      if (result) {
        onScan(result.getText());
        setIsScanning(false);
      }
    } catch (err) {
      setIsScanning(false);
      onError?.('Ошибка сканирования QR кода');
    }
  };

  const stopScanning = () => {
    if (reader) {
      reader.reset();
    }
    setIsScanning(false);
  };

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setCurrentDeviceId(devices[nextIndex].deviceId);
      
      if (isScanning) {
        stopScanning();
        setTimeout(startScanning, 100);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Button onClick={startScanning} size="lg">
              <Camera className="h-5 w-5 mr-2" />
              Начать сканирование
            </Button>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-4 border-2 border-white rounded-lg">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {isScanning ? (
          <Button onClick={stopScanning} variant="outline" className="flex-1">
            Остановить
          </Button>
        ) : (
          <Button onClick={startScanning} className="flex-1">
            <Camera className="h-4 w-4 mr-2" />
            Сканировать
          </Button>
        )}
        
        {devices.length > 1 && (
          <Button onClick={switchCamera} variant="outline" size="icon">
            <SwitchCamera className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
