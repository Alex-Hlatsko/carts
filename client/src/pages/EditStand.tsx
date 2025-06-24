import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material, ShelfItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Minus } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function EditStand() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials');
  const { showToast, ToastComponent } = useToast();

  const [number, setNumber] = useState('');
  const [theme, setTheme] = useState('');
  const [shelf1, setShelf1] = useState<ShelfItem[]>([]);
  const [shelf2, setShelf2] = useState<ShelfItem[]>([]);
  const [shelf3, setShelf3] = useState<ShelfItem[]>([]);
  const [showMaterialDialog, setShowMaterialDialog] = useState(false);
  const [currentShelf, setCurrentShelf] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stand = stands.find(s => s.id === id);

  useEffect(() => {
    if (stand) {
      setNumber(stand.number);
      setTheme(stand.theme);
      setShelf1(stand.shelf1 || []);
      setShelf2(stand.shelf2 || []);
      setShelf3(stand.shelf3 || []);
    }
  }, [stand]);

  const addMaterialToShelf = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (!material) return;

    const shelfItem: ShelfItem = { materialId, quantity: 1 };

    if (currentShelf === 1) {
      const existing = shelf1.find(item => item.materialId === materialId);
      if (existing) {
        setShelf1(shelf1.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setShelf1([...shelf1, shelfItem]);
      }
    } else if (currentShelf === 2) {
      const existing = shelf2.find(item => item.materialId === materialId);
      if (existing) {
        setShelf2(shelf2.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setShelf2([...shelf2, shelfItem]);
      }
    } else if (currentShelf === 3) {
      const existing = shelf3.find(item => item.materialId === materialId);
      if (existing) {
        setShelf3(shelf3.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setShelf3([...shelf3, shelfItem]);
      }
    }

    setShowMaterialDialog(false);
  };

  const removeMaterialFromShelf = (shelfNumber: 1 | 2 | 3, materialId: string) => {
    if (shelfNumber === 1) {
      const existing = shelf1.find(item => item.materialId === materialId);
      if (existing && existing.quantity > 1) {
        setShelf1(shelf1.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      } else {
        setShelf1(shelf1.filter(item => item.materialId !== materialId));
      }
    } else if (shelfNumber === 2) {
      const existing = shelf2.find(item => item.materialId === materialId);
      if (existing && existing.quantity > 1) {
        setShelf2(shelf2.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      } else {
        setShelf2(shelf2.filter(item => item.materialId !== materialId));
      }
    } else if (shelfNumber === 3) {
      const existing = shelf3.find(item => item.materialId === materialId);
      if (existing && existing.quantity > 1) {
        setShelf3(shelf3.map(item => 
          item.materialId === materialId 
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      } else {
        setShelf3(shelf3.filter(item => item.materialId !== materialId));
      }
    }
  };

  const openMaterialDialog = (shelfNumber: 1 | 2 | 3) => {
    setCurrentShelf(shelfNumber);
    setShowMaterialDialog(true);
  };

  const getMaterialName = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    return material?.name || 'Неизвестный материал';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !theme.trim() || !id) return;

    setIsSubmitting(true);

    const updates = {
      number: number.trim(),
      theme: theme.trim(),
      shelf1,
      shelf2,
      shelf3,
    };

    const result = await updateItem(id, updates);
    
    setIsSubmitting(false);

    if (result.success) {
      showToast('Стенд успешно обновлен', 'success');
      navigate('/stands');
    } else {
      showToast('Ошибка при обновлении стенда', 'error');
    }
  };

  const renderShelf = (shelfItems: ShelfItem[], shelfNumber: 1 | 2 | 3) => (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Полка {shelfNumber}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => openMaterialDialog(shelfNumber)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {shelfItems.length === 0 ? (
          <p className="text-gray-500 text-sm">Полка пуста</p>
        ) : (
          <div className="space-y-2">
            {shelfItems.map((item) => (
              <div key={item.materialId} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className="text-sm">{getMaterialName(item.materialId)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">x{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeMaterialFromShelf(shelfNumber, item.materialId)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!stand) {
    return (
      <div className="p-4">
        <div className="text-center">Стенд не найден</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/stands')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Редактировать стенд</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="number">Номер стенда</Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Введите номер стенда"
              required
            />
          </div>

          <div>
            <Label htmlFor="theme">Тема стенда</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Введите тему стенда"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Наполнение полок</h3>
          {renderShelf(shelf1, 1)}
          {renderShelf(shelf2, 2)}
          {renderShelf(shelf3, 3)}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </form>

      <Dialog open={showMaterialDialog} onOpenChange={setShowMaterialDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Выберите материал для полки {currentShelf}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {materials.map((material) => (
              <Button
                key={material.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => addMaterialToShelf(material.id)}
              >
                {material.name}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
