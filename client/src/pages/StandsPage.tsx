import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QRGenerator } from '@/components/QRGenerator';
import { useCollection } from '@/hooks/useFirestore';
import { Stand } from '@/types';
import { Search, QrCode, Eye } from 'lucide-react';

export function StandsPage() {
  const navigate = useNavigate();
  const { data: stands, loading, error } = useCollection<Stand>('stands');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);

  const filteredStands = stands.filter(stand =>
    stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stand.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Все стенды</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск по номеру или названию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredStands.map(stand => (
            <Card key={stand.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {stand.imageUrl && (
                    <img
                      src={stand.imageUrl}
                      alt={stand.name}
                      className="w-20 h-28 object-cover rounded-lg flex-shrink-0 border border-border"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">
                      <span className="text-primary">#{stand.number}</span> - {stand.name}
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