import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Material } from '@/types';
import { Plus, Edit, Trash2 } from 'lucide-react';

export function MaterialsPage() {
  const [newMaterial, setNewMaterial] = React.useState({ name: '', imageUrl: '' });
  const [editingMaterial, setEditingMaterial] = React.useState<Material | null>(null);
  const [showAddDialog, setShowAddDialog] = React.useState(false);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const { data: materials, addItem, updateItem, deleteItem, loading } = useCollection<Material>('materials');
  const { showSuccess, showError } = useToast();

  const handleAddMaterial = React.useCallback(async () => {
    if (!newMaterial.name.trim() || !newMaterial.imageUrl.trim()) {
      showError('Заполните все поля');
      return;
    }

    const result = await addItem({
      name: newMaterial.name.trim(),
      imageUrl: newMaterial.imageUrl.trim()
    });

    if (result.success) {
      showSuccess('Материал добавлен');
      setNewMaterial({ name: '', imageUrl: '' });
      setShowAddDialog(false);
    } else {
      showError('Ошибка при добавлении материала');
    }
  }, [newMaterial, addItem, showSuccess, showError]);

  const handleEditMaterial = React.useCallback(async () => {
    if (!editingMaterial || !editingMaterial.name.trim() || !editingMaterial.imageUrl.trim()) {
      showError('Заполните все поля');
      return;
    }

    const result = await updateItem(editingMaterial.id, {
      name: editingMaterial.name.trim(),
      imageUrl: editingMaterial.imageUrl.trim()
    });

    if (result.success) {
      showSuccess('Материал обновлён');
      setEditingMaterial(null);
      setShowEditDialog(false);
    } else {
      showError('Ошибка при обновлении материала');
    }
  }, [editingMaterial, updateItem, showSuccess, showError]);

  const handleDeleteMaterial = React.useCallback(async (material: Material) => {
    if (!confirm(`Удалить материал "${material.name}"?`)) return;

    const result = await deleteItem(material.id);

    if (result.success) {
      showSuccess('Материал удалён');
    } else {
      showError('Ошибка при удалении материала');
    }
  }, [deleteItem, showSuccess, showError]);

  if (loading) {
    return <div className="container mx-auto p-4">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Материалы</h1>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить материал
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить материал</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Название материала"
                />
              </div>
              <div>
                <Label>Ссылка на изображение</Label>
                <Input
                  value={newMaterial.imageUrl}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddDialog(false)} variant="outline" className="flex-1">
                  Отменить
                </Button>
                <Button onClick={handleAddMaterial} className="flex-1">
                  Добавить
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(material => (
          <Card key={material.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{material.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingMaterial(material);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteMaterial(material)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="%23ddd"/><text y="50" x="50" text-anchor="middle" dy=".3em">Нет фото</text></svg>';
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать материал</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <div className="space-y-4">
              <div>
                <Label>Название</Label>
                <Input
                  value={editingMaterial.name}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, name: e.target.value } : null)}
                  placeholder="Название материала"
                />
              </div>
              <div>
                <Label>Ссылка на изображение</Label>
                <Input
                  value={editingMaterial.imageUrl}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, imageUrl: e.target.value } : null)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowEditDialog(false)} variant="outline" className="flex-1">
                  Отменить
                </Button>
                <Button onClick={handleEditMaterial} className="flex-1">
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {materials.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Материалы не найдены</p>
        </div>
      )}
    </div>
  );
}
