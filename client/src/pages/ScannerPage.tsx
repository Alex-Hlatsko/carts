import * as React from 'react';
import { useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { StandActionDialog } from '@/components/StandActionDialog';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';

export function ScannerPage() {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toasts, removeToast, success, error } = useToast();

  const handleScan = (result: string) => {
    setScannedCode(result);
    setIsDialogOpen(true);
  };

  const handleError = (errorMessage: string) => {
    error(errorMessage);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setScannedCode(null);
  };

  const handleActionComplete = (message: string) => {
    success(message);
    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Сканер QR кодов</h2>
        <p className="text-muted-foreground">
          Наведите камеру на QR код стенда для принятия или выдачи
        </p>
      </div>

      <QRScanner onScan={handleScan} onError={handleError} />

      {scannedCode && (
        <StandActionDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          scannedCode={scannedCode}
          onActionComplete={handleActionComplete}
        />
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
