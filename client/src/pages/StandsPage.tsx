import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QRGenerator } from '@/components/QRGenerator';
import { StandVisualizer } from '@/components/StandVisualizer';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material } from '@/types';
import { Search, QrCode, Eye, Trash2 } from 'lucide-react';

export function StandsPage() {
  const navigate = useNavigate();
  const { data: stands, loading, error, deleteDocument } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);

  const filteredStands = (stands || []).filter(stand =>
  (stand.theme?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
  (stand.number?.toLowerCase() || '').includes(searchTerm.toLowerCase())
);


  const handleDeleteStand = async (stand: Stand) => {
    if (confirm(`Вы уверены, что хотите удалить стенд "${stand.number} - ${stand.theme}"?`)) {
      try {
        await deleteDocument(stand.id);
        alert('Стенд успешно удалён');
      } catch (error) {
        console.error('Error deleting stand:', error);
        alert('Ошибка при удалении стенда');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка подключения</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/settings')}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Все стенды</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по номеру или теме..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredStands.map(stand => (
            <div key={stand.id}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        <span className="text-primary">#{stand.number}</span> - {stand.theme}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Добавлен: {stand.dateAdded.toLocaleDateString('ru-RU')}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/stand/${stand.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Открыть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowQR(showQR === stand.id ? null : stand.id)}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedStand(selectedStand === stand.id ? null : stand.id)}
                      >
                        Макет
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteStand(stand)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Удалить
                      </Button>
                    </div>
                  </div>

                  {showQR === stand.id && (
                    <div className="mt-4 pt-4 border-t text-center">
                      <QRGenerator value={stand.id} size={150} />
                      <p className="text-xs text-muted-foreground mt-2">QR-код для стенда</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedStand === stand.id && (
                <div className="mt-4">
                  <StandVisualizer stand={stand} materials={materials} />
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredStands.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              {searchTerm ? 'Стенды не найдены' : 'Пока нет добавленных стендов'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}