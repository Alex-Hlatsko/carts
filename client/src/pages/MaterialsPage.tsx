import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/hooks/useFirestore';
import { Material } from '@/types';
import { Plus, Search, Trash2 } from 'lucide-react';

export function MaterialsPage() {
  const { data: materials, loading, error, addDocument, deleteDocument } = useCollection<Material>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    imageUrl: ''
  });

  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMaterial = async () => {
    if (!newMaterial.name.trim() || !newMaterial.imageUrl.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      await addDocument({
        name: newMaterial.name.trim(),
        imageUrl: newMaterial.imageUrl.trim(),
        dateAdded: new Date(),
      } as Omit<Material, 'id'>);

      setNewMaterial({ name: '', imageUrl: '' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Ошибка при добавлении материала');
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await deleteDocument(id);
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Ошибка при удалении материала');
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка подключения</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/settings'}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка материалов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Материалы</h1>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить материал
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Добавить новый материал</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название материала</Label>
                <Input
                  id="name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название..."
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Ссылка на изображение</Label>
                <Input
                  id="imageUrl"
                  value={newMaterial.imageUrl}
                  onChange={(e) => setNewMaterial(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMaterial}>Сохранить</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Поиск материалов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMaterials.map(material => (
            <Card key={material.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04Ny4yIDk2LjhWODEuNkg4MC44VjY4LjhIODcuMlY1My42SDEwMC44VjY4LjhIMTA3LjJWODEuNkgxMDAuOFY5Ni44SDg3LjJaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5ObyBpbWFnZTwvdGV4dD4KPHN2Zz4=';
                    }}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <h3 className="font-medium text-sm mb-2 line-clamp-2">{material.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Добавлен: {material.dateAdded.toLocaleDateString('ru-RU')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              {searchTerm ? 'Материалы не найдены' : 'Пока нет добавленных материалов'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}