import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Report } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2, Eye, QrCode, Monitor } from 'lucide-react';
import QRCode from 'qrcode';

export function Stands() {
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; standId: string }>({
    open: false,
    standId: ''
  });
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const { data: stands, remove: removeStand } = useCollection<Stand>('stands');
  const { data: reports } = useCollection<Report>('reports');
  const { toast, showToast, hideToast } = useToast();

  const handleViewDetails = async (stand: Stand) => {
    setSelectedStand(stand);
    
    // Generate QR code
    try {
      const qrUrl = await QRCode.toDataURL(`STAND_${stand.number}`);
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
    
    setShowDetailsDialog(true);
  };

  const handleDeleteStand = async () => {
    const result = await removeStand(deleteDialog.standId);
    if (result.success) {
      showToast('Стенд успешно удалён', 'success');
    } else {
      showToast('Ошибка при удалении стенда', 'error');
    }
  };

  const getLastReport = (standId: string) => {
    return reports
      .filter(r => r.standId === standId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const getStatusColor = (status: string) => {
    if (status === 'В Зале Царства') return 'default';
    return 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Стенды</h1>
      </div>

      {stands.length === 0 ? (
        <div className="text-center py-12">
          <Monitor className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет стендов</h3>
          <p className="text-muted-foreground mb-4">
            Добавьте первый стенд в разделе "Добавить стенд"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stands.map((stand) => (
            <Card key={stand.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Стенд {stand.number}</CardTitle>
                  <Badge variant={getStatusColor(stand.status)}>
                    {stand.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stand.theme}</p>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(stand)}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Подробнее
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog({ open: true, standId: stand.id })}
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Стенд {selectedStand?.number}</DialogTitle>
            <DialogDescription>
              Тема: {selectedStand?.theme}
            </DialogDescription>
          </DialogHeader>
          
          {selectedStand && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Статус</h3>
                <Badge variant={getStatusColor(selectedStand.status)}>
                  {selectedStand.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">QR код</h3>
                {qrCodeUrl && (
                  <div className="flex justify-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-2">Материалы на полках</h3>
                <div className="space-y-4">
                  {selectedStand.shelves.map((shelf, shelfIndex) => (
                    <div key={shelf.id} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Полка {shelfIndex + 1}</h4>
                      {shelf.materials.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Полка пуста</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {shelf.materials.map((material, index) => (
                            <div key={`${material.id}-${index}`} className="text-center">
                              <div className="w-16 h-16 bg-gray-100 rounded mb-1 overflow-hidden">
                                <img 
                                  src={material.imageUrl} 
                                  alt={material.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                              <p className="text-xs truncate">{material.name}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Последний отчёт</h3>
                {(() => {
                  const lastReport = getLastReport(selectedStand.id);
                  if (!lastReport) {
                    return <p className="text-sm text-muted-foreground">Отчётов пока нет</p>;
                  }
                  return (
                    <div className="border rounded-lg p-4">
                      <p className="text-sm"><strong>Тип:</strong> {lastReport.type === 'accept' ? 'Приём' : 'Выдача'}</p>
                      <p className="text-sm"><strong>Дата:</strong> {new Date(lastReport.createdAt).toLocaleString()}</p>
                      <p className="text-sm"><strong>Подпись:</strong> {lastReport.signature}</p>
                      {lastReport.issuedTo && (
                        <p className="text-sm"><strong>Выдан:</strong> {lastReport.issuedTo}</p>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, standId: '' })}
        title="Удалить стенд"
        description="Вы уверены, что хотите удалить этот стенд? Это действие нельзя отменить."
        onConfirm={handleDeleteStand}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
}
