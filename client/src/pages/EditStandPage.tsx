import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShelfManager } from '@/components/ShelfManager';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Stand, Shelf } from '@/types';

export function EditStandPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [theme, setTheme] = useState('');
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data: stands, update: updateStand } = useCollection<Stand>('stands');
  const { toasts, removeToast, success, error } = useToast();

  const stand = stands.find(s => s.id === id);

  useEffect(() => {
    if (stand) {
      setNumber(stand.number.toString());
      setTheme(stand.theme);
      setShelves(stand.shelves);
      setIsLoading(false);
    }
  }, [stand]);

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
      const updates = {
        number: standNumber,
        theme,
        shelves,
      };

      const result = await updateStand(id!, updates);
      if (result) {
        success('Стенд успешно обновлён');
        navigate(`/stands/${id}`);
      } else {
        error('Ошибка при обновлении стенда');
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Стенд не найден</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Редактировать стенд #{stand.number}</h2>

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
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
        <Button 
          onClick={() => navigate(`/stands/${id}`)} 
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
