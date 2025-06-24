import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { ShelfSelector } from '../components/ShelfSelector';
import { useStands } from '../hooks/useStands';
import { useMaterials } from '../hooks/useMaterials';
import { useNavigate } from 'react-router-dom';
import { Material } from '../types';
import toast from 'react-hot-toast';

export function AddStand() {
  const navigate = useNavigate();
  const { addStand } = useStands();
  const { materials } = useMaterials();
  const [number, setNumber] = React.useState('');
  const [theme, setTheme] = React.useState('');
  const [shelf1, setShelf1] = React.useState<Material[]>([]);
  const [shelf2, setShelf2] = React.useState<Material[]>([]);
  const [shelf3, setShelf3] = React.useState<Material[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number.trim() || !theme.trim()) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    try {
      await addStand({
        number,
        theme,
        status: 'В Зале',
        shelf1,
        shelf2,
        shelf3
      });

      // Reset form
      setNumber('');
      setTheme('');
      setShelf1([]);
      setShelf2([]);
      setShelf3([]);
      
      toast.success('Стенд успешно добавлен!');
      navigate('/stands');
    } catch (error) {
      toast.error('Ошибка при добавлении стенда');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Добавить новый стенд</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация о стенде</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number">Номер стенда *</Label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Например: 001"
                />
              </div>
              <div>
                <Label htmlFor="theme">Тема *</Label>
                <Input
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  placeholder="Например: Библейские истории"
                />
              </div>
            </div>

            <div className="space-y-4">
              <ShelfSelector
                title="Полка 1"
                materials={materials}
                selectedMaterials={shelf1}
                onMaterialsChange={setShelf1}
              />
              <ShelfSelector
                title="Полка 2"
                materials={materials}
                selectedMaterials={shelf2}
                onMaterialsChange={setShelf2}
              />
              <ShelfSelector
                title="Полка 3"
                materials={materials}
                selectedMaterials={shelf3}
                onMaterialsChange={setShelf3}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Button type="submit" className="flex-1">
                Добавить стенд
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">
                Отмена
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
