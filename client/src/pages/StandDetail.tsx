import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';

export function StandDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: stands } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const stand = stands.find(s => s.id === id);

  React.useEffect(() => {
    if (stand) {
      QRCode.toDataURL(stand.id)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('Error generating QR code:', err));
    }
  }, [stand]);

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Неизвестный материал';
  };

  const getMaterialImage = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.imageUrl;
  };

  if (!stand) {
    return (
      <div className="p-4">
        <div className="text-center">Стенд не найден</div>
      </div>
    );
  }

  const renderShelf = (shelfItems: any[], shelfNumber: number) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Полка {shelfNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        {shelfItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Полка пуста</p>
        ) : (
          <div className="space-y-3">
            {shelfItems.map((item) => (
              <div key={item.materialId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                {getMaterialImage(item.materialId) && (
                  <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={getMaterialImage(item.materialId)}
                      alt={getMaterialName(item.materialId)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <span className="text-sm font-medium">{getMaterialName(item.materialId)}</span>
                  <p className="text-xs text-gray-500">Количество: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/stands')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Стенд №{stand.number}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о стенде</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Номер:</span>
              <p className="text-lg">{stand.number}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Тема:</span>
              <p className="text-lg">{stand.theme}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Статус:</span>
              <p className={`inline-block px-2 py-1 rounded text-sm ${
                stand.status === 'В зале' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {stand.status}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Содержимое полок</h3>
          {renderShelf(stand.shelf1, 1)}
          {renderShelf(stand.shelf2, 2)}
          {renderShelf(stand.shelf3, 3)}
        </div>

        {qrCodeUrl && (
          <Card>
            <CardHeader>
              <CardTitle>QR-код стенда</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <img src={qrCodeUrl} alt="QR код стенда" className="mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                Отсканируйте этот код для работы со стендом
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
