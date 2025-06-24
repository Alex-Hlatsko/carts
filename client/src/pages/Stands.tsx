import React, { useState } from 'react';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

export function Stands() {
  const { data: stands, loading, deleteItem } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials');
  const [deleteStandId, setDeleteStandId] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const handleDelete = async (id: string) => {
    const result = await deleteItem(id);
    if (result.success) {
      showToast('Стенд успешно удален', 'success');
    } else {
      showToast('Ошибка при удалении стенда', 'error');
    }
    setDeleteStandId(null);
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Неизвестный материал';
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Стенды</h1>
        <Link to="/add-stand">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Добавить
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {stands.map((stand) => (
          <Card key={stand.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Стенд №{stand.number}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{stand.theme}</p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/edit-stand/${stand.id}`}>
                    <Button variant="outline" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setDeleteStandId(stand.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <span className={`inline-block px-2 py-1 rounded text-sm ${
                  stand.status === 'В зале' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {stand.status}
                </span>
              </div>
              
              <Link to={`/stand/${stand.id}`}>
                <Button variant="outline" className="w-full">
                  Подробнее
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}

        {stands.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Стенды отсутствуют</p>
            <Link to="/add-stand">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый стенд
              </Button>
            </Link>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteStandId !== null}
        onOpenChange={(open) => !open && setDeleteStandId(null)}
        title="Удаление стенда"
        description="Вы уверены, что хотите удалить этот стенд? Это действие нельзя отменить."
        onConfirm={() => deleteStandId && handleDelete(deleteStandId)}
        confirmText="Удалить"
        variant="destructive"
      />
    </div>
  );
}
