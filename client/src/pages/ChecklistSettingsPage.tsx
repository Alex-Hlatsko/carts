import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ChecklistSettings, ChecklistItem } from '@/types';
import { getChecklistSettings, updateChecklistSettings } from '@/lib/firestore';

export function ChecklistSettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<ChecklistSettings>({ items: [] });
  const [newItemLabel, setNewItemLabel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getChecklistSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching checklist settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateChecklistSettings(settings);
      alert('Настройки чек-листа сохранены');
    } catch (error) {
      console.error('Error saving checklist settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!newItemLabel.trim()) return;
    
    const newItem: ChecklistItem = {
      id: `item_${Date.now()}`,
      label: newItemLabel.trim(),
      required: true
    };
    
    setSettings(prev => ({
      items: [...prev.items, newItem]
    }));
    setNewItemLabel('');
  };

  const handleRemoveItem = (id: string) => {
    setSettings(prev => ({
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<ChecklistItem>) => {
    setSettings(prev => ({
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
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
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Настройки чек-листа</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Пункты проверки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.items.map((item, index) => (
            <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 p-3 sm:p-4 border rounded-lg">
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor={`item-${item.id}`}>Пункт {index + 1}</Label>
                <Input
                  id={`item-${item.id}`}
                  value={item.label}
                  onChange={(e) => handleUpdateItem(item.id, { label: e.target.value })}
                  placeholder="Введите текст проверки"
                />
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`required-${item.id}`}
                    checked={item.required}
                    onCheckedChange={(checked) => 
                      handleUpdateItem(item.id, { required: checked as boolean })
                    }
                  />
                  <Label htmlFor={`required-${item.id}`} className="text-sm">
                    Обязательный пункт
                  </Label>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRemoveItem(item.id)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-1 sm:mr-0" />
                <span className="sm:hidden">Удалить</span>
              </Button>
            </div>
          ))}

          <div className="border-t pt-6">
            <Label htmlFor="new-item">Добавить новый пункт</Label>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <Input
                id="new-item"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                placeholder="Введите новый пункт проверки"
                onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddItem} 
                disabled={!newItemLabel.trim()}
                className="w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-1 sm:mr-0" />
                <span className="sm:hidden">Добавить</span>
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
