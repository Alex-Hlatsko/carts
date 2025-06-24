import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection } from '@/hooks/useFirestore';
import { Material } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Plus, Trash2, Package } from 'lucide-react';

export function Materials() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', imageUrl: '' });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; materialId: string }>({
    open: false,
    materialId: ''
  });

  const { data: materials, add: addMaterial, remove: removeMaterial } = useCollection<Material>('materials');
  const { toast, showToast, hideToast } = useToast();

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.imageUrl) {
      showToast('Заполните все поля', 'error');
      return;
    }

    const result = await addMaterial(newMaterial);
    if (result.success) {
      showToast('Материал успешно добавлен', 'success');
      setNewMaterial({ name: '', imageUrl: '' });
      setShowAddDialog(false);
    } else {
      showToast('Ошибка при добавлении материала', 'error');
    }
  };

  const handleDeleteMaterial = async () => {
    const result = await removeMaterial(deleteDialog.materialId);
    if (result.success) {
      showToast('Материал успешно удалён', 'success');
    } else {
      showToast('Ошибка при удалении материала', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Материалы</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить материал
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый материал</DialogTitle>
              <DialogDescription>
                Заполните информацию о материале
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название материала"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Ссылка на картинку</Label>
                <Input
                  id="imageUrl"
                  value={newMaterial.imageUrl}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              
              {newMaterial.imageUrl && (
                <div className="space-y-2">
                  <Label>Предпросмотр</Label>
                  <div className="w-32 h-32 border rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={newMaterial.imageUrl} 
                      alt="Предпросмотр" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Отмена
              </Button>
              <Button onClick={handleAddMaterial}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет материалов</h3>
          <p className="text-muted-foreground mb-4">
            Добавьте первый материал для управления стендами
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {materials.map((material) => (
            <Card key={material.id} className="overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img 
                  src={material.imageUrl} 
                  alt={material.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2 truncate">{material.name}</h3>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteDialog({ open: true, materialId: material.id })}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, materialId: '' })}
        title="Удалить материал"
        description="Вы уверены, что хотите удалить этот материал? Это действие нельзя отменить."
        onConfirm={handleDeleteMaterial}
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
