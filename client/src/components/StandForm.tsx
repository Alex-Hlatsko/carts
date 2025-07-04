import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ImageUpload';
import { Stand, TemplateWithShelves } from '@/types';
import { getTemplates, createStand, updateStand, getStands } from '@/lib/firestore';

interface StandFormProps {
  isOpen: boolean;
  onClose: () => void;
  stand?: Stand | null;
}

export function StandForm({ isOpen, onClose, stand }: StandFormProps) {
  const [formData, setFormData] = useState({
    number: '',
    name: '',
    image_url: '' as string | null,
    template_id: null as string | null
  });
  const [templates, setTemplates] = useState<TemplateWithShelves[]>([]);
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
        image_url: stand.image_url || null,
        template_id: stand.template_id
      });
    } else {
      setFormData({
        number: '',
        name: '',
        image_url: null,
        template_id: null
      });
    }
    setNumberError('');
  }, [stand]);

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

      if (stand) {
        await updateStand(stand.id, formData);
      } else {
        // Generate QR code for new stand
        const qrCode = crypto.randomUUID();
        await createStand({
          ...formData,
          qr_code: qrCode,
          status: 'available'
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving stand:', error);
      alert('Ошибка при сохранении стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | null) => {
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
      <DialogContent>
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
            <Label htmlFor="name">Название</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Например: Стенд с литературой"
              required
            />
          </div>

          <div>
            <Label htmlFor="template">Шаблон стенда</Label>
            <Select 
              onValueChange={(value) => handleChange('template_id', value || null)}
              value={formData.template_id || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон (необязательно)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Без шаблона</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <ImageUpload
            value={formData.image_url}
            onChange={(imageUrl) => handleChange('image_url', imageUrl)}
            label="Изображение стенда"
          />
          
          <div className="flex gap-2 justify-end">
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
