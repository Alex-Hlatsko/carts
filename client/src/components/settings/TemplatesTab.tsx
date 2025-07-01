import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { Material, TemplateWithShelves } from '@/types';
import { getMaterials, getTemplates, createTemplate, updateTemplate, deleteTemplate } from '@/lib/firestore';

export function TemplatesTab() {
  const [templates, setTemplates] = useState<TemplateWithShelves[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithShelves | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    theme: '',
    shelves: [
      { shelf_number: 1, materials: [] as Material[] },
      { shelf_number: 2, materials: [] as Material[] },
      { shelf_number: 3, materials: [] as Material[] }
    ]
  });

  useEffect(() => {
    fetchTemplates();
    fetchMaterials();
  }, []);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleEdit = (template: TemplateWithShelves) => {
    setEditingTemplate(template);
    setFormData({
      theme: template.theme,
      shelves: [1, 2, 3].map(shelfNumber => ({
        shelf_number: shelfNumber,
        materials: template.shelves.find(s => s.shelf_number === shelfNumber)?.materials || []
      }))
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }
      
      handleFormClose();
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Ошибка при сохранении шаблона');
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTemplate(null);
    setFormData({
      theme: '',
      shelves: [
        { shelf_number: 1, materials: [] },
        { shelf_number: 2, materials: [] },
        { shelf_number: 3, materials: [] }
      ]
    });
  };

  const addMaterialToShelf = (shelfIndex: number, materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map((shelf, index) => 
        index === shelfIndex ? {
          ...shelf,
          materials: [...shelf.materials, material]
        } : shelf
      )
    }));
  };

  const removeMaterialFromShelf = (shelfIndex: number, materialId: string) => {
    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map((shelf, index) => 
        index === shelfIndex ? {
          ...shelf,
          materials: shelf.materials.filter(m => m.id !== materialId)
        } : shelf
      )
    }));
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
        <h3 className="text-lg font-semibold">Шаблоны стендов</h3>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить шаблон
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Пока нет шаблонов</p>
        </div>
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-medium">{template.theme}</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {template.shelves.map((shelf) => (
                  <div key={shelf.shelf_number} className="border rounded p-3">
                    <h5 className="font-medium mb-2">Полка {shelf.shelf_number}</h5>
                    <div className="space-y-2">
                      {shelf.materials.map((material) => (
                        <div key={material.id} className="flex items-center gap-2">
                          {material.image_url && (
                            <img
                              src={material.image_url}
                              alt={material.name}
                              className="w-8 h-8 object-cover rounded cursor-pointer"
                              onClick={() => handleImageClick(material.image_url!)}
                            />
                          )}
                          <span className="text-sm">{material.name}</span>
                        </div>
                      ))}
                      {shelf.materials.length === 0 && (
                        <p className="text-sm text-muted-foreground">Нет материалов</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={handleFormClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Редактировать шаблон' : 'Добавить шаблон'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="theme">Тема шаблона</Label>
              <Input
                id="theme"
                type="text"
                value={formData.theme}
                onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="Название темы"
                required
              />
            </div>
            
            <div className="space-y-4">
              <Label>Полки и материалы</Label>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {formData.shelves.map((shelf, shelfIndex) => (
                  <div key={shelf.shelf_number} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Полка {shelf.shelf_number}</h4>
                    
                    <div className="space-y-3">
                      <Select onValueChange={(value) => addMaterialToShelf(shelfIndex, value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Добавить материал" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials
                            .filter(m => !shelf.materials.some(sm => sm.id === m.id))
                            .map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                {material.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2">
                        {shelf.materials.map((material) => (
                          <div key={material.id} className="flex items-center gap-2 p-2 bg-muted rounded">
                            {material.image_url && (
                              <img
                                src={material.image_url}
                                alt={material.name}
                                className="w-6 h-6 object-cover rounded cursor-pointer"
                                onClick={() => handleImageClick(material.image_url!)}
                              />
                            )}
                            <span className="text-sm flex-1">{material.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterialFromShelf(shelfIndex, material.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={handleFormClose}>
                Отмена
              </Button>
              <Button type="submit">
                {editingTemplate ? 'Сохранить' : 'Создать'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
