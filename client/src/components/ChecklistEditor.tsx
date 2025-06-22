import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { ChecklistItem } from '@/types';

interface ChecklistEditorProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}

export function ChecklistEditor({ items, onChange }: ChecklistEditorProps) {
  const [editingItems, setEditingItems] = useState<ChecklistItem[]>(items);

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      question: '',
      type: 'boolean',
      required: true,
    };
    const newItems = [...editingItems, newItem];
    setEditingItems(newItems);
    onChange(newItems);
  };

  const updateItem = (id: string, updates: Partial<ChecklistItem>) => {
    const newItems = editingItems.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setEditingItems(newItems);
    onChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = editingItems.filter(item => item.id !== id);
    setEditingItems(newItems);
    onChange(newItems);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    const newItems = [...editingItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setEditingItems(newItems);
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Редактировать чек-лист</h3>
        <Button onClick={addItem}>
          <Plus className="h-4 w-4 mr-2" />
          Добавить пункт
        </Button>
      </div>

      {editingItems.map((item, index) => (
        <Card key={item.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <CardTitle className="text-base">Пункт {index + 1}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="ml-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor={`question-${item.id}`}>Вопрос</Label>
              <Input
                id={`question-${item.id}`}
                value={item.question}
                onChange={(e) => updateItem(item.id, { question: e.target.value })}
                placeholder="Введите вопрос..."
              />
            </div>

            <div>
              <Label htmlFor={`type-${item.id}`}>Тип ответа</Label>
              <Select
                value={item.type}
                onValueChange={(value: 'boolean' | 'text' | 'rating') =>
                  updateItem(item.id, { type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boolean">Да/Нет</SelectItem>
                  <SelectItem value="text">Текст</SelectItem>
                  <SelectItem value="rating">Оценка (1-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`required-${item.id}`}
                checked={item.required}
                onCheckedChange={(checked) =>
                  updateItem(item.id, { required: checked as boolean })
                }
              />
              <Label htmlFor={`required-${item.id}`}>Обязательное поле</Label>
            </div>
          </CardContent>
        </Card>
      ))}

      {editingItems.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Нет пунктов в чек-листе. Добавьте первый пункт.
          </CardContent>
        </Card>
      )}
    </div>
  );
}