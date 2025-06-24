import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, SwitchCamera } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const codeReaderRef = React.useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [videoDevices, setVideoDevices] = React.useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = React.useState(0);

  const startScanning = async (deviceIndex: number = 0) => {
    try {
      setError('');
      
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
      
      codeReaderRef.current = new BrowserMultiFormatReader();
      
      // Get available video devices
      const devices = await codeReaderRef.current.listVideoInputDevices();
      console.log('Available video devices:', devices);
      setVideoDevices(devices);
      
      if (devices.length === 0) {
        setError('Камера не найдена');
        return;
      }

      // Find back camera or use provided index
      let selectedDeviceIndex = deviceIndex;
      if (deviceIndex === 0) {
        const backCameraIndex = devices.findIndex(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );
        selectedDeviceIndex = backCameraIndex >= 0 ? backCameraIndex : 0;
      }
      
      setCurrentDeviceIndex(selectedDeviceIndex);
      const selectedDevice = devices[selectedDeviceIndex];
      console.log('Using camera:', selectedDevice);

      setIsScanning(true);

      // Start decoding from video element
      await codeReaderRef.current.decodeFromVideoDevice(
        selectedDevice.deviceId,
        videoRef.current!,
        (result, error) => {
          if (result) {
            console.log('QR Code detected:', result.getText());
            onScan(result.getText());
            setIsScanning(false);
          }
          if (error && error.name !== 'NotFoundException') {
            console.error('Scanning error:', error);
          }
        }
      );

    } catch (error) {
      console.error('Camera access error:', error);
      setError('Ошибка доступа к камере: ' + (error as Error).message);
      setIsScanning(false);
    }
  };

  React.useEffect(() => {
    startScanning();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [onScan]);

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      const nextIndex = (currentDeviceIndex + 1) % videoDevices.length;
      startScanning(nextIndex);
    }
  };

  const handleManualInput = () => {
    const result = prompt('Введите код стенда:');
    if (result) {
      onScan(result);
    }
  };

  const handleClose = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    onClose();
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Сканирование QR кода</h3>
        <div className="flex space-x-2">
          {videoDevices.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleSwitchCamera}>
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {error ? (
        <div className="text-center space-y-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
          <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Проверьте разрешения камеры в браузере
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 md:h-80 object-cover bg-black"
          />
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
              </div>
            </div>
          )}
          {isScanning && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
              Наведите камеру на QR код
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
        <Button onClick={handleManualInput} variant="outline" className="flex-1">
          Ввести код вручную
        </Button>
        <Button onClick={handleClose} variant="outline" className="flex-1">
          Отмена
        </Button>
      </div>
    </div>
  );
}
