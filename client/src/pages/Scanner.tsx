import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Camera } from 'lucide-react';
import { QRScanner } from '../components/QRScanner';
import { StandActionDialog } from '../components/StandActionDialog';

export function Scanner() {
  const [isScanning, setIsScanning] = React.useState(false);
  const [scannedStandId, setScannedStandId] = React.useState<string | null>(null);

  const handleScan = (result: string) => {
    console.log('Scanned result:', result);
    setScannedStandId(result);
    setIsScanning(false);
  };

  const handleStartScan = () => {
    console.log('Starting QR scan...');
    setIsScanning(true);
  };

  const handleCloseDialog = () => {
    setScannedStandId(null);
  };

  const handleCloseScan = () => {
    setIsScanning(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Сканер QR кодов
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isScanning ? (
            <div className="text-center space-y-4">
              <div className="p-8">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  Нажмите кнопку ниже, чтобы отсканировать QR код стенда
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Убедитесь, что разрешили доступ к камере в браузере
                </p>
              </div>
              <Button onClick={handleStartScan} size="lg" className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Начать сканирование
              </Button>
            </div>
          ) : (
            <QRScanner onScan={handleScan} onClose={handleCloseScan} />
          )}
        </CardContent>
      </Card>

      {scannedStandId && (
        <StandActionDialog
          standId={scannedStandId}
          isOpen={!!scannedStandId}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
}
