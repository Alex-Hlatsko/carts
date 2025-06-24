import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stand } from '../types';
import { QRCodeGenerator } from './QRCodeGenerator';

interface StandDetailsDialogProps {
  stand: Stand;
  isOpen: boolean;
  onClose: () => void;
}

export function StandDetailsDialog({ stand, isOpen, onClose }: StandDetailsDialogProps) {
  const renderShelf = (materials: any[] = [], shelfNumber: number) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Полка {shelfNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        {!materials || materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пусто</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {materials.map((material, index) => (
              <div key={index} className="text-xs">
                <div className="aspect-square rounded-lg overflow-hidden mb-1 bg-gray-100">
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="truncate text-center">{material.name}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Стенд №{stand.number} - {stand.theme}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Информация о стенде</h3>
              <p><strong>Номер:</strong> {stand.number}</p>
              <p><strong>Тема:</strong> {stand.theme}</p>
              <p><strong>Статус:</strong> {stand.status}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Содержимое полок</h3>
              <div className="space-y-2">
                {renderShelf(stand.shelf1, 1)}
                {renderShelf(stand.shelf2, 2)}
                {renderShelf(stand.shelf3, 3)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">QR код стенда</h3>
            <QRCodeGenerator value={stand.id} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
