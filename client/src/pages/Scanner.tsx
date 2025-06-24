import React, { useState } from 'react';
import { QRScanner } from '@/components/QRScanner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Scanner() {
  const [showScanner, setShowScanner] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [scannedStandId, setScannedStandId] = useState<string>('');
  const navigate = useNavigate();

  const handleScan = (data: string) => {
    console.log('Scanned:', data);
    setScannedStandId(data);
    setShowScanner(false);
    setShowActionDialog(true);
  };

  const handleReceive = () => {
    setShowActionDialog(false);
    navigate(`/receive/${scannedStandId}`);
  };

  const handleGiveOut = () => {
    setShowActionDialog(false);
    navigate(`/give-out/${scannedStandId}`);
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Сканер QR-кодов</h1>
        <p className="text-gray-600">Отсканируйте QR-код стенда для работы с ним</p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={() => setShowScanner(true)}
          className="w-full max-w-xs h-32 flex flex-col gap-3"
        >
          <QrCode size={48} />
          <span className="text-lg">Сканировать QR-код</span>
        </Button>
      </div>

      {showScanner && (
        <QRScanner
          onScan={handleScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Выберите действие</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Button onClick={handleReceive} className="w-full">
              Принять стенд
            </Button>
            <Button onClick={handleGiveOut} variant="outline" className="w-full">
              Выдать стенд
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
