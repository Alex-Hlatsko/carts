import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShelfManager } from '@/components/ShelfManager';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Stand, Shelf } from '@/types';

export function AddStandPage() {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [theme, setTheme] = useState('');
  const [shelves, setShelves] = useState<Shelf[]>([
    { id: '1', position: 1, materials: [] },
    { id: '2', position: 2, materials: [] },
    { id: '3', position: 3, materials: [] },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { add: addStand } = useCollection<Stand>('stands');
  const { toasts, removeToast, success, error } = useToast();

  const handleSubmit = async () => {
    if (!number || !theme) {
      error('Заполните номер и тему стенда');
      return;
    }

    const standNumber = parseInt(number);
    if (isNaN(standNumber) || standNumber <= 0) {
      error('Номер стенда должен быть положительным числом');
      return;
    }

    setIsSubmitting(true);

    try {
      const newStand: Omit<Stand, 'id'> = {
        number: standNumber,
        theme,
        status: 'В зале',
        shelves,
        createdAt: new Date(),
      };

      const result = await addStand(newStand);
      if (result) {
        success('Стенд успешно добавлен');
        navigate('/stands');
      } else {
        error('Ошибка при добавлении стенда');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateShelf = (shelfId: string, updatedShelf: Shelf) => {
    setShelves(prev => prev.map(shelf => 
      shelf.id === shelfId ? updatedShelf : shelf
    ));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Добавить новый стенд</h2>

      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="number">Номер стенда</Label>
            <Input
              id="number"
              type="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Введите номер стенда"
            />
          </div>
          <div>
            <Label htmlFor="theme">Тема</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Введите тему стенда"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Полки стенда</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shelves.map((shelf) => (
              <ShelfManager
                key={shelf.id}
                shelf={shelf}
                onUpdate={(updatedShelf) => updateShelf(shelf.id, updatedShelf)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Добавление...' : 'Добавить стенд'}
        </Button>
        <Button 
          onClick={() => navigate('/stands')} 
          variant="outline"
        >
          Отмена
        </Button>
      </div>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
