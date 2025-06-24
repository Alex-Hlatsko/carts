import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { SwitchCamera, StopCircle } from 'lucide-react';

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

  const startContinuousScanning = useCallback(async () => {
    if (!reader || !videoRef.current || !currentDeviceId) return;

    try {
      setIsScanning(true);
      
      await reader.decodeFromVideoDevice(
        currentDeviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            onScan(result.getText());
            stopScanning();
          }
        }
      );
    } catch (err) {
      setIsScanning(false);
      onError?.('Ошибка сканирования QR кода');
    }
  }, [reader, currentDeviceId, onScan, onError]);

  const stopScanning = useCallback(() => {
    if (reader) {
      reader.reset();
    }
    setIsScanning(false);
  }, [reader]);

  const switchCamera = () => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
      const nextIndex = (currentIndex + 1) % devices.length;
      setCurrentDeviceId(devices[nextIndex].deviceId);
      
      if (isScanning) {
        stopScanning();
        setTimeout(() => {
          startContinuousScanning();
        }, 100);
      }
    }
  };

  // Auto start scanning when component mounts and device is selected
  useEffect(() => {
    if (currentDeviceId && !isScanning) {
      const timer = setTimeout(() => {
        startContinuousScanning();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentDeviceId, startContinuousScanning, isScanning]);

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        
        {isScanning && (
          <div className="absolute inset-4 border-2 border-white rounded-lg">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-white text-center">
                <div className="text-sm font-medium">Наведите на QR код</div>
                <div className="text-xs mt-1">Сканирование автоматическое</div>
              </div>
            </div>
          </div>
        )}

        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <div className="text-lg font-medium mb-2">Сканер QR кода</div>
              <Button onClick={startContinuousScanning} size="lg" variant="secondary">
                Запустить сканер
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        {isScanning ? (
          <Button onClick={stopScanning} variant="outline" className="flex-1">
            <StopCircle className="h-4 w-4 mr-2" />
            Остановить
          </Button>
        ) : (
          <Button onClick={startContinuousScanning} className="flex-1">
            Запустить сканер
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
