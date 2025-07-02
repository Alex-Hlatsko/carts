import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { Material, StandTemplate } from '@/types';
import { getMaterials, getTemplates, createTemplate, updateTemplate, deleteTemplate, getTemplateShelves, updateTemplateShelves } from '@/lib/firestore';

interface TemplateFormData {
  theme: string;
  shelves: Array<{
    number: number;
    materials: number[];
  }>;
}

export function TemplatesTab() {
  const [templates, setTemplates] = useState<StandTemplate[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [templateMaterials, setTemplateMaterials] = useState<Map<number, Map<number, Material[]>>>(new Map());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StandTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<TemplateFormData>({
    theme: '',
    shelves: [
      { number: 1, materials: [] },
      { number: 2, materials: [] },
      { number: 3, materials: [] }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesData, materialsData] = await Promise.all([
        getTemplates(),
        getMaterials()
      ]);
      
      setTemplates(templatesData);
      setMaterials(materialsData);
      
      // Load materials for all templates
      const templatesMap = new Map<number, Map<number, Material[]>>();
      
      for (const template of templatesData) {
        const templateMaterialsMap = new Map<number, Material[]>();
        const shelves = await getTemplateShelves(template.id);
        
        [1, 2, 3].forEach(shelfNumber => {
          const shelfMaterials = shelves
            .filter(shelf => shelf.shelf_number === shelfNumber)
            .map(shelf => materialsData.find(m => m.id === shelf.material_id))
            .filter(Boolean) as Material[];
          templateMaterialsMap.set(shelfNumber, shelfMaterials);
        });
        
        templatesMap.set(template.id, templateMaterialsMap);
      }
      
      setTemplateMaterials(templatesMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (template: StandTemplate) => {
    setEditingTemplate(template);
    
    // Load template shelves
    const shelves = await getTemplateShelves(template.id);
    const shelvesData = [1, 2, 3].map(shelfNumber => ({
      number: shelfNumber,
      materials: shelves
        .filter(shelf => shelf.shelf_number === shelfNumber)
        .map(shelf => shelf.material_id)
    }));
    
    setFormData({
      theme: template.theme,
      shelves: shelvesData
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      return;
    }

    try {
      await deleteTemplate(id);
      fetchData();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let templateId: number;
      
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, { theme: formData.theme });
        templateId = editingTemplate.id;
      } else {
        const newTemplate = await createTemplate({ theme: formData.theme });
        templateId = newTemplate.id;
      }
      
      // Update template shelves
      const shelves = formData.shelves.map(shelf => ({
        shelf_number: shelf.number,
        material_ids: shelf.materials
      }));
      await updateTemplateShelves(templateId, shelves);
      
      handleFormClose();
      fetchData();
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
        { number: 1, materials: [] },
        { number: 2, materials: [] },
        { number: 3, materials: [] }
      ]
    });
  };

  const addMaterialToShelf = (shelfNumber: number, materialId: number) => {
    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map(shelf => 
        shelf.number === shelfNumber 
          ? { ...shelf, materials: [...shelf.materials, materialId] }
          : shelf
      )
    }));
  };

  const removeMaterialFromShelf = (shelfNumber: number, materialId: number) => {
    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map(shelf => 
        shelf.number === shelfNumber 
          ? { ...shelf, materials: shelf.materials.filter(id => id !== materialId) }
          : shelf
      )
    }));
  };

  const getMaterialById = (id: number) => {
    return materials.find(m => m.id === id);
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
        <h3 className="text-lg font-semibold">Шаблоны стендов</h3>
        <Button onClick={() => setIsFormOpen(true)} size="sm" className="w-full sm:w-auto">
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
          {templates.map((template) => {
            const templateMats = templateMaterials.get(template.id) || new Map();
            
            return (
              <div key={template.id} className="border rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                  <h4 className="text-lg font-medium">{template.theme}</h4>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(template)}
                      className="flex-1 sm:flex-none"
                    >
                      <Edit className="w-4 h-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">Изменить</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(template.id)}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                      <span className="sm:hidden">Удалить</span>
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((shelfNumber) => {
                    const shelfMaterials = templateMats.get(shelfNumber) || [];
                    
                    return (
                      <div key={shelfNumber} className="border rounded p-3">
                        <h5 className="font-medium mb-2">Полка {shelfNumber}</h5>
                        <div className="space-y-2">
                          {shelfMaterials.map((material) => (
                            <div key={material.id} className="flex items-center gap-2">
                              {material.image_url && (
                                <img
                                  src={material.image_url}
                                  alt={material.name}
                                  className="w-6 h-6 object-cover rounded cursor-pointer"
                                  onClick={() => handleImageClick(material.image_url!)}
                                />
                              )}
                              <span className="text-sm flex-1 truncate">{material.name}</span>
                            </div>
                          ))}
                          {shelfMaterials.length === 0 && (
                            <p className="text-sm text-muted-foreground">Нет материалов</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
                {formData.shelves.map((shelf) => (
                  <div key={shelf.number} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Полка {shelf.number}</h4>
                    
                    <div className="space-y-3">
                      <Select onValueChange={(value) => addMaterialToShelf(shelf.number, parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Добавить материал" />
                        </SelectTrigger>
                        <SelectContent>
                          {materials
                            .filter(m => !shelf.materials.includes(m.id))
                            .map((material) => (
                              <SelectItem key={material.id} value={material.id.toString()}>
                                <div className="flex items-center gap-2">
                                  {material.image_url && (
                                    <img
                                      src={material.image_url}
                                      alt={material.name}
                                      className="w-4 h-4 object-cover rounded"
                                    />
                                  )}
                                  <span>{material.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      <div className="space-y-2">
                        {shelf.materials.map((materialId) => {
                          const material = getMaterialById(materialId);
                          if (!material) return null;
                          
                          return (
                            <div key={materialId} className="flex items-center gap-2 p-2 bg-muted rounded">
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
                                onClick={() => removeMaterialFromShelf(shelf.number, materialId)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-4">
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
