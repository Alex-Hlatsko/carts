import React, { useState } from 'react';
import { useCollection } from '@/hooks/useFirestore';
import { Material } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

export function Materials() {
  const { data: materials, loading, addItem, updateItem, deleteItem } = useCollection<Material>('materials');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    const materialData = {
      name: name.trim(),
      imageUrl: imageUrl.trim() || undefined
    };

    let result;
    if (editingMaterial) {
      result = await updateItem(editingMaterial.id, materialData);
    } else {
      result = await addItem(materialData);
    }

    setIsSubmitting(false);

    if (result.success) {
      showToast(
        editingMaterial ? 'Материал успешно обновлен' : 'Материал успешно добавлен',
        'success'
      );
      handleCloseDialog();
    } else {
      showToast('Ошибка при сохранении материала', 'error');
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setName(material.name);
    setImageUrl(material.imageUrl || '');
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteItem(id);
    if (result.success) {
      showToast('Материал успешно удален', 'success');
    } else {
      showToast('Ошибка при удалении материала', 'error');
    }
    setDeleteMaterialId(null);
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingMaterial(null);
    setName('');
    setImageUrl('');
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
        <h1 className="text-2xl font-bold">Материалы</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {materials.map((material) => (
          <Card key={material.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm leading-tight">{material.name}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleEdit(material)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setDeleteMaterialId(material.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {material.imageUrl ? (
                <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Нет изображения</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {materials.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <p>Материалы отсутствуют</p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить первый материал
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showAddDialog} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>
              {editingMaterial ? 'Редактировать материал' : 'Добавить материал'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название материала"
                required
              />
            </div>

            <div>
              <Label htmlFor="imageUrl">Ссылка на изображение</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Отмена
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteMaterialId !== null}
        onOpenChange={(open) => !open && setDeleteMaterialId(null)}
        title="Удаление материала"
        description="Вы уверены, что хотите удалить этот материал? Это действие нельзя отменить."
        onConfirm={() => deleteMaterialId && handleDelete(deleteMaterialId)}
        confirmText="Удалить"
        variant="destructive"
      />
    </div>
  );
}
