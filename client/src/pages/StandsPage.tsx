import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Stand } from '@/types';
import { Eye, Edit, Trash2 } from 'lucide-react';

export function StandsPage() {
  const navigate = useNavigate();
  const { data: stands, remove: removeStand } = useCollection<Stand>('stands');
  const { toasts, removeToast, success, error } = useToast();

  const handleViewStand = (standId: string) => {
    navigate(`/stands/${standId}`);
  };

  const handleEditStand = (standId: string) => {
    navigate(`/stands/${standId}/edit`);
  };

  const handleRemoveStand = async (stand: Stand) => {
    if (confirm(`Вы уверены, что хотите удалить стенд #${stand.number} "${stand.theme}"?`)) {
      const result = await removeStand(stand.id);
      if (result) {
        success('Стенд успешно удалён');
      } else {
        error('Ошибка при удалении стенда');
      }
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'В зале' ? 'default' : 'secondary';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Стенды</h2>
        <Button onClick={() => navigate('/add-stand')}>
          Добавить стенд
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stands.map((stand) => (
          <Card key={stand.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Стенд #{stand.number}</CardTitle>
                <Badge variant={getStatusBadgeVariant(stand.status)}>
                  {stand.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground truncate">
                {stand.theme}
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewStand(stand.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>
                <Button
                  onClick={() => handleEditStand(stand.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Изменить
                </Button>
                <Button
                  onClick={() => handleRemoveStand(stand)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stands.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Нет стендов. Добавьте первый стенд для начала работы.
          </p>
        </div>
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
