import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Image } from 'lucide-react';
import { ImageUpload } from '@/components/ImageUpload';
import { Material } from '@/types';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '@/lib/firestore';

export function MaterialsTab() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    image_url: null as string | null
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
      name: material.name,
      image_url: material.image_url
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
    setFormData({ name: '', image_url: null });
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
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Материалы</h3>
        <Button onClick={() => setIsFormOpen(true)}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div key={material.id} className="border rounded-lg p-4">
              <div className="space-y-3">
                {material.image_url && (
                  <div className="cursor-pointer" onClick={() => handleImageClick(material.image_url!)}>
                    <img
                      src={material.image_url}
                      alt={material.name}
                      className="w-full h-32 object-cover rounded hover:opacity-80 transition-opacity"
                    />
                  </div>
                )}
                <h4 className="font-medium">{material.name}</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(material)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(material.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
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
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Название материала"
                required
              />
            </div>
            
            <ImageUpload
              value={formData.image_url}
              onChange={(imageUrl) => setFormData(prev => ({ ...prev, image_url: imageUrl }))}
              label="Изображение материала"
            />
            
            <div className="flex gap-2 justify-end">
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
