import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Report } from '@/types';
import { Package } from 'lucide-react';
import QRCode from 'qrcode';

export function StandDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  const { data: stands } = useCollection<Stand>('stands');
  const { data: reports } = useCollection<Report>('reports');

  const stand = stands.find(s => s.id === id);
  const standReports = reports.filter(r => r.standId === id).slice(0, 3);

  React.useEffect(() => {
    if (stand) {
      const generateQR = async () => {
        try {
          const qrCode = await QRCode.toDataURL(`STAND_${stand.number}`);
          setQrCodeUrl(qrCode);
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      };
      generateQR();
    }
  }, [stand]);

  if (!stand) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Стенд не найден</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('ru-RU');
    }
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'В зале' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Стенд #{stand.number}</h2>
          <p className="text-muted-foreground">{stand.theme}</p>
        </div>
        <Badge variant={getStatusBadgeVariant(stand.status)}>
          {stand.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QR Код</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 bg-muted rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Загрузка QR кода...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация о стенде</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Номер:</span>
              <p className="font-medium">#{stand.number}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Тема:</span>
              <p className="font-medium">{stand.theme}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Статус:</span>
              <p className="font-medium">{stand.status}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Создан:</span>
              <p className="font-medium">{formatDate(stand.createdAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Материалы на полках</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {stand.shelves.map((shelf) => (
            <div key={shelf.id}>
              <div className="flex items-center gap-2 mb-3">
                <Package className="h-4 w-4" />
                <h4 className="font-medium">Полка {shelf.position}</h4>
                <span className="text-sm text-muted-foreground">
                  ({shelf.materials.length} материалов)
                </span>
              </div>
              
              {shelf.materials.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {shelf.materials.map((material, index) => (
                    <div key={`${material.id}-${index}`} className="text-center">
                      <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
                        <img
                          src={material.imageUrl}
                          alt={material.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <p className="text-xs truncate">{material.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Полка пуста</p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {standReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Последние отчёты</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {standReports.map((report) => (
              <div key={report.id} className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-medium">{report.responsibleName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(report.date)}
                  </p>
                </div>
                <Badge variant={report.isServiced ? 'default' : 'secondary'}>
                  {report.isServiced ? 'Обслужено' : 'Проверен'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
