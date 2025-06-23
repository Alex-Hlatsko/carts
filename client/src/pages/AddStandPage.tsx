import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MaterialSelector } from '@/components/MaterialSelector';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material } from '@/types';
import { Save } from 'lucide-react';

export function AddStandPage() {
  const navigate = useNavigate();
  const { addDocument, error: firestoreError } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials');
  
  const [formData, setFormData] = useState({
    number: '',
    theme: '',
  });
  
  const [shelves, setShelves] = useState([
    { id: '1', number: 1 as const, materials: [] as string[] },
    { id: '2', number: 2 as const, materials: [] as string[] },
    { id: '3', number: 3 as const, materials: [] as string[] },
  ]);

  const handleShelfMaterialsChange = (shelfNumber: number, materialIds: string[]) => {
    setShelves(prev => prev.map(shelf => 
      shelf.number === shelfNumber 
        ? { ...shelf, materials: materialIds }
        : shelf
    ));
  };

  const handleSubmit = async () => {
    if (!formData.number.trim()) {
      alert('Пожалуйста, введите номер стенда');
      return;
    }

    if (!formData.theme.trim()) {
      alert('Пожалуйста, введите тему стенда');
      return;
    }

    if (firestoreError) {
      alert('Ошибка: ' + firestoreError);
      return;
    }

    try {
      const standData: Omit<Stand, 'id'> = {
        ...formData,
        shelves,
        dateAdded: new Date(),
      };

      await addDocument(standData);
      navigate('/stands');
    } catch (error) {
      console.error('Error adding stand:', error);
      alert('Ошибка при добавлении стенда');
    }
  };

  if (firestoreError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка подключения</h2>
            <p className="text-muted-foreground mb-4">{firestoreError}</p>
            <Button onClick={() => navigate('/settings')}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Добавить стенд</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="number">Номер стенда</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Введите номер стенда"
                />
              </div>

              <div>
                <Label htmlFor="theme">Тема стенда</Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="Введите тему стенда"
                />
              </div>
            </CardContent>
          </Card>

          {shelves.map(shelf => (
            <Card key={shelf.id}>
              <CardHeader>
                <CardTitle>Полка {shelf.number}</CardTitle>
              </CardHeader>
              <CardContent>
                <MaterialSelector
                  selectedMaterials={shelf.materials}
                  availableMaterials={materials}
                  onSelectionChange={(materialIds) => handleShelfMaterialsChange(shelf.number, materialIds)}
                />
              </CardContent>
            </Card>
          ))}

          <Button onClick={handleSubmit} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Сохранить стенд
          </Button>
        </div>
      </div>
    </div>
  );
}