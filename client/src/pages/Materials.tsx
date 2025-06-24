import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Material } from '@/types';
import { Pencil, Trash2, Plus } from 'lucide-react';

export function Materials() {
  const { data: materials, addItem, updateItem, deleteItem } = useCollection<Material>('materials', 'name');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({ name: '', imageUrl: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.imageUrl.trim()) return;

    const success = editingMaterial
      ? await updateItem(editingMaterial.id, formData)
      : await addItem({ ...formData, createdAt: new Date() });

    if (success) {
      setShowToast({ 
        message: editingMaterial ? 'Материал обновлен' : 'Материал добавлен', 
        type: 'success' 
      });
      setFormData({ name: '', imageUrl: '' });
      setIsAddDialogOpen(false);
      setEditingMaterial(null);
    } else {
      setShowToast({ message: 'Ошибка при сохранении', type: 'error' });
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({ name: material.name, imageUrl: material.imageUrl });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      setShowToast({ message: 'Материал удален', type: 'success' });
    } else {
      setShowToast({ message: 'Ошибка при удалении', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', imageUrl: '' });
    setEditingMaterial(null);
  };

  return (
    <Layout title="Материалы">
      <div className="space-y-4">
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Добавить материал
            </Button>
          </DialogTrigger>
          <DialogContent>
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
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Ссылка на изображение</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingMaterial ? 'Обновить' : 'Добавить'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{material.name}</h3>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(material)}
                    className="flex-1"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeleteConfirm(material.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Удалить материал"
        description="Вы уверены, что хотите удалить этот материал?"
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
