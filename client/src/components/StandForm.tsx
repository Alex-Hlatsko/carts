import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, StandTemplate, Material } from '@/types';
import { getTemplates, createStand, updateStand, getStands, getMaterialsByIds } from '@/lib/firestore';

interface StandFormProps {
  isOpen: boolean;
  onClose: () => void;
  stand?: Stand | null;
}

export function StandForm({ isOpen, onClose, stand }: StandFormProps) {
  const [formData, setFormData] = useState<{
    number: string;
    theme: string;
    status: string;
    templateId?: string;
  }>({
    number: '',
    theme: '',
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
        console.log('StandForm: Fetching templates...');
        const templatesData = await getTemplates();
        console.log('StandForm: Templates fetched:', templatesData);
        setTemplates(templatesData);
      } catch (error) {
        console.error('StandForm: Error fetching templates:', error);
      }
    };

    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (stand) {
      console.log('StandForm: Editing stand:', stand);
      setFormData({
        number: stand.number,
        theme: stand.theme,
        status: stand.status,
        templateId: undefined
      });
      
      setTemplateMaterials(new Map());
    } else {
      console.log('StandForm: Creating new stand');
      setFormData({
        number: '',
        theme: '',
        status: 'available'
      });
      setTemplateMaterials(new Map());
    }
    setNumberError('');
    setSelectedTemplate(null);
  }, [stand]);

  const loadTemplateData = async (templateId: string) => {
    try {
      console.log('StandForm: Loading template data for:', templateId);
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);

        if (template.shelves && template.shelves.length > 0) {
          const allMaterialIds = template.shelves.flatMap(shelf => shelf.materials || []);
          console.log('StandForm: Material IDs to fetch:', allMaterialIds);
          
          if (allMaterialIds.length > 0) {
            const materials = await getMaterialsByIds(allMaterialIds);
            const materialsMap = new Map<number, Material[]>();
            
            template.shelves.forEach(shelf => {
              const shelfMats = (shelf.materials || [])
                .map(matId => materials.find(m => m.id === matId))
                .filter(Boolean) as Material[];
              materialsMap.set(shelf.number, shelfMats);
            });
            
            console.log('StandForm: Template materials map:', materialsMap);
            setTemplateMaterials(materialsMap);
          }
        }
      }
    } catch (error) {
      console.error('StandForm: Error loading template data:', error);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    console.log('StandForm: Template selected:', templateId);
    
    if (!templateId) {
      setSelectedTemplate(null);
      setFormData(prev => ({
        ...prev,
        theme: '',
        templateId: undefined
      }));
      setTemplateMaterials(new Map());
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        theme: template.theme,
        templateId: templateId
      }));
      
      await loadTemplateData(templateId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNumberError('');

    try {
      console.log('StandForm: Submitting form:', formData);
      
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

      // Create shelves from template if selected
      let shelves: Array<{ number: number; materials: string[] }> = [];
      if (selectedTemplate && selectedTemplate.shelves) {
        shelves = selectedTemplate.shelves;
      }

      const standData = {
        number: formData.number,
        theme: formData.theme,
        shelves: shelves,
        status: formData.status,
        qrCode: stand?.qrCode || Math.random().toString(36).substring(2, 15)
      };

      console.log('StandForm: Saving stand data:', standData);

      if (stand) {
        await updateStand(stand.id, standData);
      } else {
        await createStand(standData);
      }
      
      console.log('StandForm: Stand saved successfully');
      onClose();
    } catch (error) {
      console.error('StandForm: Error saving stand:', error);
      alert('Ошибка при сохранении стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
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
              value={formData.number}
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
            <Select onValueChange={handleTemplateSelect} value={formData.templateId || ''}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон или создайте новый" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Создать новый стенд</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="theme">Название стенда</Label>
            <Input
              id="theme"
              type="text"
              value={formData.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
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
                            {material.imageUrl && (
                              <img
                                src={material.imageUrl}
                                alt={material.name}
                                className="w-6 h-6 object-cover rounded cursor-pointer"
                                onClick={() => {
                                  const modal = document.createElement('div');
                                  modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                  modal.innerHTML = `
                                    <div class="relative max-w-full max-h-full">
                                      <img src="${material.imageUrl}" class="max-w-full max-h-full rounded-lg" />
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
              value={formData.status}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Доступен</SelectItem>
                <SelectItem value="В Зале Царства">В Зале Царства</SelectItem>
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
