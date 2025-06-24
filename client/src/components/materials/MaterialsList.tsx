import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { getMaterials, deleteMaterial } from '@/lib/firebase';

interface Material {
  id: string;
  name: string;
  imageUrl: string;
}

export function MaterialsList() {
  const [materials, setMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadMaterials = async () => {
    try {
      const data = await getMaterials();
      setMaterials(data as Material[]);
    } catch (error) {
      console.error('Error loading materials:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadMaterials();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот материал?')) {
      try {
        await deleteMaterial(id);
        await loadMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Ошибка при удалении материала');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Загрузка материалов...</p>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Материалы не найдены</p>
        <p className="text-sm text-muted-foreground mt-2">
          Добавьте первый материал, нажав кнопку "Добавить"
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {materials.map((material) => (
        <Card key={material.id} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
              <img
                src={material.imageUrl}
                alt={material.name}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0zNSA0MEg2NVY2MEgzNVY0MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+';
                }}
              />
            </div>
            <h3 className="font-medium text-sm mb-2 text-card-foreground">{material.name}</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-3 w-3" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                className="flex-1"
                onClick={() => handleDelete(material.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
