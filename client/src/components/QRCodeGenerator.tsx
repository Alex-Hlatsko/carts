import * as React from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
}

export function QRCodeGenerator({ value }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: 200,
          margin: 2,
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [value]);

  if (!qrCodeUrl) {
    return <div>Генерация QR кода...</div>;
  }

  return (
    <div className="text-center">
      <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Код: {value}</p>
    </div>
  );
}
