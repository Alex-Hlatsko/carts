import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ChecklistItem } from '@/types';

interface ChecklistFormProps {
  items: ChecklistItem[];
  onSubmit: (responses: Record<string, any>) => void;
  onCancel: () => void;
  title: string;
}

export function ChecklistForm({ items, onSubmit, onCancel, title }: ChecklistFormProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const handleResponseChange = (itemId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    const missingRequired = items
      .filter(item => item.required)
      .find(item => !responses[item.id] && responses[item.id] !== false);

    if (missingRequired) {
      alert(`Пожалуйста, заполните обязательное поле: ${missingRequired.question}`);
      return;
    }

    onSubmit(responses);
  };

  const renderInput = (item: ChecklistItem) => {
    switch (item.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={item.id}
              checked={responses[item.id] || false}
              onCheckedChange={(checked) => handleResponseChange(item.id, checked)}
            />
            <Label htmlFor={item.id}>Да</Label>
          </div>
        );

      case 'text':
        return (
          <Input
            value={responses[item.id] || ''}
            onChange={(e) => handleResponseChange(item.id, e.target.value)}
            placeholder="Введите ответ..."
          />
        );

      case 'rating':
        return (
          <div className="space-y-2">
            <Slider
              value={[responses[item.id] || 3]}
              onValueChange={(value) => handleResponseChange(item.id, value[0])}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>1</span>
              <span>Оценка: {responses[item.id] || 3}</span>
              <span>5</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map(item => (
          <div key={item.id} className="space-y-2">
            <Label className="text-base">
              {item.question}
              {item.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderInput(item)}
          </div>
        ))}

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSubmit} className="flex-1">
            Сохранить
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Отмена
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}