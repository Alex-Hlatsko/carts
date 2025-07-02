import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, StandTemplate, Material } from '@/types';
import { getTemplates, createStand, updateStand, getStands, getTemplateShelves, getMaterialsByIds } from '@/lib/firestore';

interface StandFormProps {
  isOpen: boolean;
  onClose: () => void;
  stand?: Stand | null;
}

export function StandForm({ isOpen, onClose, stand }: StandFormProps) {
  const [formData, setFormData] = useState<Partial<Stand>>({
    number: '',
    name: '',
    status: 'available'
  });
  const [templates, setTemplates] = useState<StandTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<StandTemplate | null>(null);
  const [templateMaterials, setTemplateMaterials] = useState<Map<number, Material[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [numberError, setNumberError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const templatesData = await getTemplates();
        setTemplates(templatesData);
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (stand) {
      setFormData({
        number: stand.number,
        name: stand.name,
        status: stand.status,
        template_id: stand.template_id
      });
      
      // Load template materials if stand has a template
      if (stand.template_id) {
        loadTemplateData(stand.template_id);
      }
    } else {
      setFormData({
        number: '',
        name: '',
        status: 'available'
      });
      setTemplateMaterials(new Map());
    }
    setNumberError('');
    setSelectedTemplate(null);
  }, [stand]);

  const loadTemplateData = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
      }

      const shelves = await getTemplateShelves(templateId);
      const materialIds = shelves.map(shelf => shelf.material_id);
      
      if (materialIds.length > 0) {
        const materials = await getMaterialsByIds(materialIds);
        const materialsMap = new Map<number, Material[]>();
        
        // Group materials by shelf number
        [1, 2, 3].forEach(shelfNumber => {
          const shelfMats = shelves
            .filter(shelf => shelf.shelf_number === shelfNumber)
            .map(shelf => materials.find(m => m.id === shelf.material_id))
            .filter(Boolean) as Material[];
          materialsMap.set(shelfNumber, shelfMats);
        });
        
        setTemplateMaterials(materialsMap);
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) {
      setSelectedTemplate(null);
      setFormData(prev => ({
        ...prev,
        name: '',
        template_id: undefined
      }));
      setTemplateMaterials(new Map());
      return;
    }

    const templateIdNum = parseInt(templateId);
    const template = templates.find(t => t.id === templateIdNum);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        name: template.theme,
        template_id: templateIdNum
      }));
      
      // Load materials for template
      await loadTemplateData(templateIdNum);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNumberError('');

    try {
      // Check for duplicate numbers
      if (!stand || stand.number !== formData.number) {
        const existingStands = await getStands();
        const duplicateStand = existingStands.find(s => s.number === formData.number);
        if (duplicateStand) {
          setNumberError('Стенд с таким номером уже существует');
          setLoading(false);
          return;
        }
      }

      const standData = {
        ...formData,
        qr_code: stand?.qr_code || Math.random().toString(36).substring(2, 15)
      } as Partial<Stand>;

      if (stand) {
        await updateStand(stand.id, standData);
      } else {
        await createStand(standData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving stand:', error);
      alert('Ошибка при сохранении стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Stand, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'number') {
      setNumberError('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {stand ? 'Редактировать стенд' : 'Добавить стенд'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="number">Номер стенда</Label>
            <Input
              id="number"
              type="text"
              value={formData.number || ''}
              onChange={(e) => handleChange('number', e.target.value)}
              placeholder="Например: 001"
              required
            />
            {numberError && (
              <p className="text-sm text-destructive mt-1">{numberError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="template">Выбрать шаблон</Label>
            <Select onValueChange={handleTemplateSelect} value={formData.template_id?.toString() || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон или создайте новый" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Создать новый стенд</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="name">Название стенда</Label>
            <Input
              id="name"
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Например: Была ли жизнь сотворена?"
              required
            />
          </div>

          {selectedTemplate && (
            <div className="space-y-3">
              <Label>Предварительный просмотр шаблона</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 border rounded">
                {[1, 2, 3].map(shelfNumber => {
                  const materials = templateMaterials.get(shelfNumber) || [];
                  return (
                    <div key={shelfNumber} className="border rounded p-2">
                      <h4 className="font-medium mb-2 text-sm">Полка {shelfNumber}</h4>
                      <div className="space-y-2">
                        {materials.map((material) => (
                          <div key={material.id} className="flex items-center gap-2">
                            {material.image_url && (
                              <img
                                src={material.image_url}
                                alt={material.name}
                                className="w-6 h-6 object-cover rounded cursor-pointer"
                                onClick={() => {
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                  modal.innerHTML = `
                                    <div class="relative">
                                      <img src="${material.image_url}" class="max-w-full max-h-full rounded-lg" />
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
                                }}
                              />
                            )}
                            <span className="text-xs flex-1">{material.name}</span>
                          </div>
                        ))}
                        {materials.length === 0 && (
                          <p className="text-xs text-muted-foreground">Нет материалов</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="status">Статус</Label>
            <Select 
              onValueChange={(value) => handleChange('status', value)}
              value={formData.status || 'available'}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Доступен</SelectItem>
                <SelectItem value="issued">Выдан</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
