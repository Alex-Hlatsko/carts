import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stand } from '@/types';
import { Edit, Trash2, QrCode } from 'lucide-react';

interface StandCardProps {
  stand: Stand;
  onEdit: (stand: Stand) => void;
  onDelete: (stand: Stand) => void;
  onShowQR: (stand: Stand) => void;
  onClick: (stand: Stand) => void;
}

export function StandCard({ stand, onEdit, onDelete, onShowQR, onClick }: StandCardProps) {
  const handleCardClick = React.useCallback(() => {
    onClick(stand);
  }, [onClick, stand]);

  const handleEdit = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(stand);
  }, [onEdit, stand]);

  const handleDelete = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(stand);
  }, [onDelete, stand]);

  const handleShowQR = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onShowQR(stand);
  }, [onShowQR, stand]);

  const isAvailable = stand.status === 'В зале';

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Стенд #{stand.number}</CardTitle>
            <Badge variant={isAvailable ? 'default' : 'secondary'} className="mt-1">
              {stand.status}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleShowQR}>
              <QrCode className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">Тема:</p>
        <p className="font-medium text-sm mb-3">{stand.theme}</p>
        
        <div className="space-y-1 text-xs">
          <div>Полка 1: {stand.shelf1.length} материалов</div>
          <div>Полка 2: {stand.shelf2.length} материалов</div>
          <div>Полка 3: {stand.shelf3.length} материалов</div>
        </div>
      </CardContent>
    </Card>
  );
}
