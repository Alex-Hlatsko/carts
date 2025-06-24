import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Stand } from '@/types';
import { Pencil, Trash2, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Stands() {
  const { data: stands, deleteItem } = useCollection<Stand>('stands', 'number');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      setShowToast({ message: 'Стенд удален', type: 'success' });
    } else {
      setShowToast({ message: 'Ошибка при удалении', type: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'В зале' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';
  };

  return (
    <Layout title="Стенды">
      <div className="space-y-4">
        {stands.map((stand) => (
          <Card key={stand.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Стенд #{stand.number}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/stands/${stand.id}/edit`);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(stand.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent 
              className="pt-0"
              onClick={() => navigate(`/stands/${stand.id}`)}
            >
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Тема:</span> {stand.theme}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Статус:</span>{' '}
                  <span className={getStatusColor(stand.status)}>
                    {stand.status}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <QrCode className="h-3 w-3" />
                  <span>Код: {stand.qrCode}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {stands.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Нет стендов</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Удалить стенд"
        description="Вы уверены, что хотите удалить этот стенд? Это действие нельзя отменить."
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        variant="destructive"
        confirmText="Удалить"
      />

      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
