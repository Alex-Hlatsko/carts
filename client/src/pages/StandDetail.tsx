import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Report } from '@/types';
import { Pencil, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

export function StandDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: stands } = useCollection<Stand>('stands');
  const { data: reports } = useCollection<Report>('reports');
  const [stand, setStand] = useState<Stand | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string>('');
  const [lastReport, setLastReport] = useState<Report | null>(null);

  useEffect(() => {
    const foundStand = stands.find(s => s.id === id);
    setStand(foundStand || null);
  }, [stands, id]);

  useEffect(() => {
    if (stand) {
      QRCode.toDataURL(stand.qrCode)
        .then(setQrCodeImage)
        .catch(console.error);
      
      const standReports = reports
        .filter(r => r.standId === stand.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLastReport(standReports[0] || null);
    }
  }, [stand, reports]);

  if (!stand) {
    return (
      <Layout 
        title="Стенд" 
        showBackButton 
        onBack={() => navigate('/stands')}
      >
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Стенд не найден</p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    return status === 'В зале' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';
  };

  return (
    <Layout 
      title={`Стенд #${stand.number}`} 
      showBackButton 
      onBack={() => navigate('/stands')}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Информация о стенде</CardTitle>
              <Button
                size="sm"
                onClick={() => navigate(`/stands/${stand.id}/edit`)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Редактировать
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Номер:</span> {stand.number}
            </div>
            <div>
              <span className="font-medium">Тема:</span> {stand.theme}
            </div>
            <div>
              <span className="font-medium">Статус:</span>{' '}
              <span className={getStatusColor(stand.status)}>
                {stand.status}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR код стенда
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-2">
              {qrCodeImage && (
                <img
                  src={qrCodeImage}
                  alt="QR Code"
                  className="w-32 h-32 border rounded-lg"
                />
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Код: {stand.qrCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Материалы на полках</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stand.shelves.map((shelf, index) => (
              <div key={shelf.id}>
                <h4 className="font-medium mb-2">Полка {index + 1}</h4>
                {shelf.materials.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Нет материалов
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {shelf.materials.map((material, materialIndex) => (
                      <div key={materialIndex}>
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={material.imageUrl}
                            alt={material.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs mt-1 text-center">{material.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {lastReport && (
          <Card>
            <CardHeader>
              <CardTitle>Последний отчёт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="font-medium">Дата:</span>{' '}
                {new Date(lastReport.date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Ответственный:</span> {lastReport.responsibleName}
              </div>
              <div>
                <span className="font-medium">Статус:</span>{' '}
                <span className={lastReport.isServiced ? 'text-green-600' : 'text-blue-600'}>
                  {lastReport.isServiced ? 'Обслужено' : 'Принято'}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/reports/${lastReport.id}`)}
                className="mt-2"
              >
                Посмотреть отчёт
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
