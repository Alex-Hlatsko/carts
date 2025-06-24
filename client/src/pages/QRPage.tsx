import * as React from 'react';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function QRPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">QR коды</h1>
        <p className="text-muted-foreground">
          Создавайте QR-коды для текста, ссылок и другой информации
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Генератор QR-кода</CardTitle>
        </CardHeader>
        <CardContent>
          <QRGenerator />
        </CardContent>
      </Card>
    </div>
  );
}