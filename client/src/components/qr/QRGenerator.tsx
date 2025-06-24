import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import QRCode from 'qrcode';

export function QRGenerator() {
  const [text, setText] = React.useState('');
  const [qrCode, setQrCode] = React.useState<string>('');

  const generateQR = async () => {
    if (text.trim()) {
      try {
        const qr = await QRCode.toDataURL(text, {
          width: 300,
          margin: 2,
        });
        setQrCode(qr);
      } catch (error) {
        console.error('Ошибка генерации QR-кода:', error);
      }
    }
  };

  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = qrCode;
      link.click();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="qr-text">Текст для QR-кода</Label>
        <Input
          id="qr-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите текст, URL или любую информацию..."
        />
      </div>

      <Button onClick={generateQR} disabled={!text.trim()}>
        Создать QR-код
      </Button>

      {qrCode && (
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <img
              src={qrCode}
              alt="QR Code"
              className="mx-auto border rounded-lg"
            />
            <Button onClick={downloadQR} variant="outline">
              Скачать QR-код
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}