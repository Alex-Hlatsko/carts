import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, QrCode, Eye, Package } from 'lucide-react';
import { StandForm } from '@/components/StandForm';
import { Stand, StandWithTemplate } from '@/types';
import { getStands, deleteStand } from '@/lib/firestore';
import QRCodeLib from 'qrcode';

export function StandsPage() {
  const navigate = useNavigate();
  const [stands, setStands] = useState<StandWithTemplate[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('StandsPage: Fetching stands...');
      setLoading(true);
      const standsData = await getStands();
      
      // Add template names to stands
      const standsWithTemplates: StandWithTemplate[] = standsData.map(stand => ({
        ...stand,
        templateName: stand.theme
      }));
      
      console.log('StandsPage: Stands fetched:', standsWithTemplates);
      setStands(standsWithTemplates);
    } catch (error) {
      console.error('StandsPage: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewStand = (stand: Stand) => {
    console.log('StandsPage: Viewing stand:', stand);
    navigate(`/stand-detail/${stand.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот стенд?')) {
      return;
    }

    try {
      console.log('StandsPage: Deleting stand:', id);
      await deleteStand(id);
      fetchData();
    } catch (error) {
      console.error('StandsPage: Error deleting stand:', error);
      alert('Ошибка при удалении стенда');
    }
  };

  const handleDownloadQR = async (standId: string, standNumber: string) => {
    try {
      console.log('StandsPage: Generating QR code for stand:', standId);
      // Use the stand ID as QR code content
      const qrCodeDataURL = await QRCodeLib.toDataURL(standId, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `stand-${standNumber}-qr.png`;
      link.click();
      console.log('StandsPage: QR code downloaded');
    } catch (error) {
      console.error('StandsPage: Error downloading QR code:', error);
      alert('Ошибка при создании QR-кода');
    }
  };

  const handleFormClose = () => {
    console.log('StandsPage: Form closed, refreshing data');
    setIsFormOpen(false);
    setEditingStand(null);
    fetchData();
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Стенды</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка стендов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Стенды</h1>
        <Button onClick={() => setIsFormOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Добавить стенд
        </Button>
      </div>

      {stands.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              У вас пока нет стендов
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить первый стенд
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stands.map((stand) => (
            <Card key={stand.id} className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg font-bold text-center mb-2">
                      #{stand.number}
                    </CardTitle>
                    <div className="text-center">
                      <Badge 
                        variant={stand.status === 'available' || stand.status === 'В Зале Царства' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {stand.status === 'available' ? 'Доступен' : 
                         stand.status === 'В Зале Царства' ? 'В Зале Царства' : 
                         stand.status === 'issued' ? 'Выдан' : stand.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-muted-foreground line-clamp-2">
                    {stand.theme || 'Без названия'}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadQR(stand.id, stand.number);
                    }}
                    className="flex-1 text-xs"
                  >
                    <QrCode className="w-3 h-3 mr-1" />
                    QR
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewStand(stand);
                    }}
                    className="flex-1 text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Открыть
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StandForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        stand={editingStand}
      />
    </div>
  );
}
