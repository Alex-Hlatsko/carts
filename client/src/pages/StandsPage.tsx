import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { StandForm } from '@/components/StandForm';
import { Stand, Material, Report } from '@/types';
import { getStands, deleteStand, getReports, getMaterialsByIds } from '@/lib/firestore';
import QRCodeLib from 'qrcode';

export function StandsPage() {
  const [stands, setStands] = useState<Stand[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [materialsCache, setMaterialsCache] = useState<Map<string, Material>>(new Map());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [standsData, reportsData] = await Promise.all([
        getStands(),
        getReports()
      ]);
      
      setStands(standsData);
      setReports(reportsData);
      
      // Fetch materials for all stands
      const allMaterialIds = new Set<string>();
      standsData.forEach(stand => {
        stand.data.shelves.forEach(shelf => {
          shelf.materials.forEach(materialId => {
            allMaterialIds.add(materialId);
          });
        });
      });
      
      if (allMaterialIds.size > 0) {
        const materials = await getMaterialsByIds(Array.from(allMaterialIds));
        const materialsMap = new Map();
        materials.forEach(material => {
          materialsMap.set(material.id, material);
        });
        setMaterialsCache(materialsMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLastReport = (standId: string) => {
    const standReports = reports
      .filter(r => r.data.standId === standId && r.data.action === 'receive')
      .sort((a, b) => {
        const aTime = a.data.timestamp || '0';
        const bTime = b.data.timestamp || '0';
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
    
    return standReports[0] || null;
  };

  const handleEdit = (stand: Stand) => {
    setEditingStand(stand);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот стенд?')) {
      return;
    }

    try {
      await deleteStand(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting stand:', error);
    }
  };

  const handleDownloadQR = async (qrCode: string, standNumber: string) => {
    try {
      if (!qrCode) {
        alert('QR-код не найден для этого стенда');
        return;
      }
      
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrCode, {
        width: 200,
        margin: 2
      });
      
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `stand-${standNumber}-qr.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      alert('Ошибка при создании QR-кода');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingStand(null);
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getMaterialsForShelf = (stand: Stand, shelfNumber: number): Material[] => {
    const shelf = stand.data.shelves.find(s => s.number === shelfNumber);
    if (!shelf) return [];
    
    return shelf.materials
      .map(id => materialsCache.get(id))
      .filter(Boolean) as Material[];
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Загрузка...</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {stands.map((stand) => {
            const lastReport = getLastReport(stand.id);
            
            return (
              <Card key={stand.id} className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">
                        Стенд #{stand.data.number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {stand.data.theme}
                      </p>
                    </div>
                    <Badge 
                      variant={stand.data.status === 'В Зале Царства' ? 'default' : 'secondary'}
                      className="ml-2 shrink-0"
                    >
                      {stand.data.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Template preview */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Материалы:</h4>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[1, 2, 3].map(shelfNumber => {
                        const materials = getMaterialsForShelf(stand, shelfNumber);
                        return (
                          <div key={shelfNumber} className="border rounded p-2">
                            <div className="font-medium mb-1">Полка {shelfNumber}</div>
                            <div className="space-y-1">
                              {materials.slice(0, 2).map(material => (
                                <div key={material.id} className="flex items-center gap-1">
                                  {material.data.imageUrl && (
                                    <img
                                      src={material.data.imageUrl}
                                      alt={material.data.name}
                                      className="w-4 h-4 object-cover rounded"
                                    />
                                  )}
                                  <span className="truncate text-xs">
                                    {material.data.name}
                                  </span>
                                </div>
                              ))}
                              {materials.length > 2 && (
                                <span className="text-muted-foreground">
                                  +{materials.length - 2} еще
                                </span>
                              )}
                              {materials.length === 0 && (
                                <span className="text-muted-foreground">Пусто</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {lastReport && (
                    <div className="p-2 bg-muted rounded text-xs">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-medium">Последний отчет:</span>
                      </div>
                      <p className="text-muted-foreground">
                        {formatDate(lastReport.data.timestamp || '')} - {lastReport.data.handledBy}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadQR(stand.data.qrCode || '', stand.data.number)}
                      className="flex-1"
                    >
                      <QrCode className="w-3 h-3 mr-1" />
                      QR
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(stand)}
                      className="flex-1"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Изменить
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(stand.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
