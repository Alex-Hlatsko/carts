import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { Material, MaterialData } from '@/types';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/lib/firestore';

export function MaterialsTab() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<MaterialData>({
    name: '',
    imageUrl: undefined
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setFormData({
      name: material.data.name,
      imageUrl: material.data.imageUrl
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      await deleteMaterial(id);
      fetchMaterials();
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, formData);
      } else {
        await createMaterial(formData);
      }
      
      handleFormClose();
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Ошибка при сохранении материала');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingMaterial(null);
    setFormData({ name: '', imageUrl: undefined });
  };

  const handleImageClick = (imageUrl: string) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="relative">
        <img src="${imageUrl}" class="max-w-full max-h-full rounded-lg" />
        <button class="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    modal.onclick = () => document.body.removeChild(modal);
    document.body.appendChild(modal);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Материалы</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Добавить материал
        </Button>
      </div>

      {materials.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Пока нет материалов</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div key={material.id} className="border rounded-lg p-3 sm:p-4">
              <div className="space-y-3">
                {material.data.imageUrl && (
                  <div className="cursor-pointer" onClick={() => handleImageClick(material.data.imageUrl!)}>
                    <img
                      src={material.data.imageUrl}
                      alt={material.data.name}
                      className="w-full h-32 object-cover rounded hover:opacity-80 transition-opacity"
                    />
                  </div>
                )}
                <h4 className="font-medium line-clamp-2">{material.data.name}</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(material)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Изменить</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(material.id)}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                    <span className="sm:hidden">Удалить</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-md">
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
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название материала"
                required
              />
            </div>
            
            <ImageUpload
              value={formData.imageUrl || null}
              onChange={(imageUrl) => setFormData(prev => ({ ...prev, imageUrl: imageUrl || undefined }))}
              label="Изображение материала"
            />
            
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={handleFormClose}>
                Отмена
              </Button>
              <Button type="submit">
                {editingMaterial ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
