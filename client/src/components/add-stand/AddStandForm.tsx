import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShelfMaterials } from './ShelfMaterials';
import { addStand } from '@/lib/firebase';

export function AddStandForm() {
  const [standNumber, setStandNumber] = React.useState('');
  const [theme, setTheme] = React.useState('');
  const [shelves, setShelves] = React.useState<Record<number, string[]>>({
    1: [],
    2: [],
    3: []
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addStand({
        number: standNumber,
        theme,
        shelves
      });
      
      // Reset form
      setStandNumber('');
      setTheme('');
      setShelves({ 1: [], 2: [], 3: [] });
      
      alert('Стенд успешно создан!');
    } catch (error) {
      console.error('Error adding stand:', error);
      alert('Ошибка при создании стенда');
    } finally {
      setLoading(false);
    }
  };

  const updateShelf = (shelfNumber: number, materials: string[]) => {
    setShelves(prev => ({ ...prev, [shelfNumber]: materials }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="standNumber" className="text-card-foreground">Номер стенда</Label>
            <Input
              id="standNumber"
              value={standNumber}
              onChange={(e) => setStandNumber(e.target.value)}
              placeholder="STAND-001"
              required
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="theme" className="text-card-foreground">Тема стенда</Label>
            <Input
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Библейские истории"
              required
              className="bg-input border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {[1, 2, 3].map((shelfNumber) => (
        <ShelfMaterials
          key={shelfNumber}
          shelfNumber={shelfNumber}
          materials={shelves[shelfNumber]}
          onMaterialsChange={(materials) => updateShelf(shelfNumber, materials)}
        />
      ))}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Создание...' : 'Создать стенд'}
      </Button>
    </form>
  );
}
