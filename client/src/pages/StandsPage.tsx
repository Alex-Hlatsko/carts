import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QRGenerator } from '@/components/QRGenerator';
import { useCollection } from '@/hooks/useFirestore';
import { Stand } from '@/types';
import { ArrowLeft, Search, QrCode, Eye } from 'lucide-react';

export function StandsPage() {
  const navigate = useNavigate();
  const { data: stands, loading } = useCollection<Stand>('stands');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQR, setShowQR] = useState<string | null>(null);

  const filteredStands = stands.filter(stand =>
    stand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stand.languages.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Все стенды</h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию или языку..."
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
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{stand.name}</h3>
                    <p className="text-gray-600 mb-2">Состояние: {stand.condition}</p>
                    
                    {stand.languages.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Языки: </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {stand.languages.map(lang => (
                            <span key={lang} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {lang}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {stand.inventory.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-500">Инвентарь: </span>
                        <div className="inline-flex flex-wrap gap-1">
                          {stand.inventory.map(item => (
                            <span key={item} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-400">
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
                    <p className="text-xs text-gray-500 mt-2">QR-код для стенда</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStands.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {searchTerm ? 'Стенды не найдены' : 'Пока нет добавленных стендов'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}