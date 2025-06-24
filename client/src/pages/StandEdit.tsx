import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material } from '@/types';
import { Plus, X } from 'lucide-react';

export function StandEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem } = useCollection<Stand>('stands');
  const { data: materials } = useCollection<Material>('materials', 'name');
  const [stand, setStand] = useState<Stand | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    theme: '',
    shelves: [
      { id: '1', materials: [] },
      { id: '2', materials: [] },
      { id: '3', materials: [] }
    ]
  });
  const [selectedShelf, setSelectedShelf] = useState<string | null>(null);
  const [materialDialog, setMaterialDialog] = useState(false);

  useEffect(() => {
    const foundStand = stands.find(s => s.id === id);
    if (foundStand) {
      setStand(foundStand);
      setFormData({
        number: foundStand.number,
        theme: foundStand.theme,
        shelves: foundStand.shelves
      });
    }
  }, [stands, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stand || !formData.number.trim() || !formData.theme.trim()) return;

    const success = await updateItem(stand.id, {
      number: formData.number,
      theme: formData.theme,
      shelves: formData.shelves
    });

    if (success) {
      setShowToast({ message: 'Стенд успешно обновлен', type: 'success' });
      setTimeout(() => navigate(`/stands/${stand.id}`), 1500);
    } else {
      setShowToast({ message: 'Ошибка при обновлении стенда', type: 'error' });
    }
  };

  const addMaterialToShelf = (material: Material) => {
    if (!selectedShelf) return;
    
    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map(shelf =>
        shelf.id === selectedShelf
          ? { ...shelf, materials: [...shelf.materials, material] }
          : shelf
      )
    }));
    setMaterialDialog(false);
  };

  const removeMaterialFromShelf = (shelfId: string, materialIndex: number) => {
    setFormData(prev => ({
      ...prev,
      shelves: prev.shelves.map(shelf =>
        shelf.id === shelfId
          ? { ...shelf, materials: shelf.materials.filter((_, index) => index !== materialIndex) }
          : shelf
      )
    }));
  };

  if (!stand) {
    return (
      <Layout 
        title="Редактировать стенд" 
        showBackButton 
        onBack={() => navigate('/stands')}
      >
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Стенд не найден</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Редактировать стенд" 
      showBackButton 
      onBack={() => navigate(`/stands/${stand.id}`)}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="number">Номер стенда</Label>
            <Input
              id="number"
              value={formData.number}
              onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="theme">Тема</Label>
            <Input
              id="theme"
              value={formData.theme}
              onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Полки</h3>
          {formData.shelves.map((shelf, index) => (
            <Card key={shelf.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Полка {index + 1}</CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setSelectedShelf(shelf.id);
                      setMaterialDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить материал
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {shelf.materials.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Материалы не добавлены
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {shelf.materials.map((material, materialIndex) => (
                      <div key={materialIndex} className="relative">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={material.imageUrl}
                            alt={material.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs mt-1 text-center">{material.name}</p>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => removeMaterialFromShelf(shelf.id, materialIndex)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button type="submit" className="w-full">
          Сохранить изменения
        </Button>
      </form>

      <Dialog open={materialDialog} onOpenChange={setMaterialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Выберите материал</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {materials.map((material) => (
              <div
                key={material.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg"
                onClick={() => addMaterialToShelf(material)}
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-2">
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-center">{material.name}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
