import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Stand } from '@/types';
import { generateQRCode } from '@/utils/qrCode';

interface QRCodeDialogProps {
  open: boolean;
  onClose: () => void;
  stand: Stand | null;
}

export function QRCodeDialog({ open, onClose, stand }: QRCodeDialogProps) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (stand && open) {
      generateQRCode(stand.id)
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [stand, open]);

  if (!stand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR-код стенда #{stand.number}</DialogTitle>
        </DialogHeader>
        
        <div className="text-center space-y-4">
          {qrCodeUrl && (
            <img 
              src={qrCodeUrl} 
              alt={`QR код для стенда #${stand.number}`}
              className="mx-auto rounded-lg"
            />
          )}
          <p className="text-sm text-muted-foreground">
            Отсканируйте этот код для работы со стендом
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
