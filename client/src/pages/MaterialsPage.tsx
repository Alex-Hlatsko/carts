import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Material } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

export function MaterialsPage() {
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ name: '', imageUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: materials, add: addMaterial, remove: removeMaterial } = useCollection<Material>('materials');
  const { toasts, removeToast, success, error } = useToast();

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.imageUrl) {
      error('Заполните все поля');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addMaterial(newMaterial);
      if (result) {
        success('Материал успешно добавлен');
        setNewMaterial({ name: '', imageUrl: '' });
        setIsAddingMaterial(false);
      } else {
        error('Ошибка при добавлении материала');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMaterial = async (id: string, name: string) => {
    if (confirm(`Вы уверены, что хотите удалить материал "${name}"?`)) {
      const result = await removeMaterial(id);
      if (result) {
        success('Материал успешно удалён');
      } else {
        error('Ошибка при удалении материала');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Материалы</h2>
        <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Добавить материал
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить новый материал</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название материала"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Ссылка на изображение</Label>
                <Input
                  id="imageUrl"
                  value={newMaterial.imageUrl}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              {newMaterial.imageUrl && (
                <div>
                  <Label>Предварительный просмотр</Label>
                  <img
                    src={newMaterial.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddMaterial} 
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Добавление...' : 'Добавить'}
                </Button>
                <Button 
                  onClick={() => setIsAddingMaterial(false)} 
                  variant="outline"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm truncate">{material.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square mb-2">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <Button
                onClick={() => handleRemoveMaterial(material.id, material.name)}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {materials.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Нет материалов. Добавьте первый материал для начала работы.
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
