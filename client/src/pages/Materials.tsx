import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useMaterials } from '../hooks/useMaterials';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Materials() {
  const navigate = useNavigate();
  const { materials, loading, addMaterial, deleteMaterial } = useMaterials();
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    
    try {
      await addMaterial({ name, imageUrl });
      setName('');
      setImageUrl('');
      setIsOpen(false);
      toast.success('Материал успешно добавлен');
    } catch (error) {
      toast.error('Ошибка при добавлении материала');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await deleteMaterial(id);
        toast.success('Материал удален');
      } catch (error) {
        toast.error('Ошибка при удалении материала');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Материалы</h1>
        <div className="ml-auto">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Добавить материал
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4">
              <DialogHeader>
                <DialogTitle>Добавить новый материал</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Название</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите название материала"
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Ссылка на изображение</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Добавить материал
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {materials.map((material) => (
          <Card key={material.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base md:text-lg truncate flex-1">{material.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
