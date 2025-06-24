import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MaterialSelector } from '@/components/stands/MaterialSelector';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Material, Stand } from '@/types';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AddStandPage() {
  const navigate = useNavigate();
  const [number, setNumber] = React.useState('');
  const [theme, setTheme] = React.useState('');
  const [shelf1Materials, setShelf1Materials] = React.useState<Material[]>([]);
  const [shelf2Materials, setShelf2Materials] = React.useState<Material[]>([]);
  const [shelf3Materials, setShelf3Materials] = React.useState<Material[]>([]);
  const [currentShelf, setCurrentShelf] = React.useState<number | null>(null);
  const [showMaterialSelector, setShowMaterialSelector] = React.useState(false);

  const { data: materials } = useCollection<Material>('materials');
  const { data: stands, addItem } = useCollection<Stand>('stands');
  const { showSuccess, showError } = useToast();

  const isNumberTaken = React.useMemo(() => {
    if (!number) return false;
    return stands.some(stand => stand.number === parseInt(number));
  }, [stands, number]);

  const handleShelfEdit = React.useCallback((shelfNumber: number) => {
    setCurrentShelf(shelfNumber);
    setShowMaterialSelector(true);
  }, []);

  const getCurrentShelfMaterials = React.useCallback(() => {
    switch (currentShelf) {
      case 1: return shelf1Materials;
      case 2: return shelf2Materials;
      case 3: return shelf3Materials;
      default: return [];
    }
  }, [currentShelf, shelf1Materials, shelf2Materials, shelf3Materials]);

  const handleMaterialToggle = React.useCallback((material: Material) => {
    const currentMaterials = getCurrentShelfMaterials();
    const isSelected = currentMaterials.some(m => m.id === material.id);

    let newMaterials: Material[];
    if (isSelected) {
      // Remove one instance of the material
      const index = currentMaterials.findIndex(m => m.id === material.id);
      newMaterials = [...currentMaterials];
      newMaterials.splice(index, 1);
    } else {
      // Add the material
      newMaterials = [...currentMaterials, material];
    }

    switch (currentShelf) {
      case 1: setShelf1Materials(newMaterials); break;
      case 2: setShelf2Materials(newMaterials); break;
      case 3: setShelf3Materials(newMaterials); break;
    }
  }, [currentShelf, getCurrentShelfMaterials]);

  const handleSubmit = React.useCallback(async () => {
    if (!number.trim() || !theme.trim()) {
      showError('Заполните все обязательные поля');
      return;
    }

    if (isNumberTaken) {
      showError('Стенд с таким номером уже существует');
      return;
    }

    const result = await addItem({
      number: parseInt(number),
      theme: theme.trim(),
      status: 'В зале',
      shelf1: shelf1Materials,
      shelf2: shelf2Materials,
      shelf3: shelf3Materials,
      qrCode: undefined
    });

    if (result.success) {
      showSuccess('Стенд успешно добавлен');
      navigate('/stands');
    } else {
      showError('Ошибка при добавлении стенда');
    }
  }, [number, theme, isNumberTaken, shelf1Materials, shelf2Materials, shelf3Materials, addItem, showSuccess, showError, navigate]);

  const getMaterialCounts = React.useCallback((materials: Material[]) => {
    const counts = new Map<string, number>();
    materials.forEach(material => {
      counts.set(material.id, (counts.get(material.id) || 0) + 1);
    });
    return counts;
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/stands')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Добавить стенд</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Номер стенда *</Label>
              <Input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Введите номер стенда"
                className={isNumberTaken ? 'border-red-500' : ''}
              />
              {isNumberTaken && (
                <p className="text-sm text-red-500 mt-1">
                  Стенд с таким номером уже существует
                </p>
              )}
            </div>

            <div>
              <Label>Тема *</Label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="Введите тему стенда"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Материалы на полках</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map(shelfNum => {
              const materials = shelfNum === 1 ? shelf1Materials : 
                               shelfNum === 2 ? shelf2Materials : shelf3Materials;
              const materialCounts = getMaterialCounts(materials);
              
              return (
                <div key={shelfNum} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Полка {shelfNum}</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleShelfEdit(shelfNum)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить материалы
                    </Button>
                  </div>
                  
                  {materials.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from(materialCounts.entries()).map(([materialId, count]) => {
                        const material = materials.find(m => m.id === materialId);
                        if (!material) return null;
                        
                        return (
                          <Badge key={materialId} variant="secondary" className="flex items-center gap-1">
                            <img 
                              src={material.imageUrl} 
                              alt={material.name}
                              className="w-4 h-4 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="%23ddd"/></svg>';
                              }}
                            />
                            {material.name}
                            {count > 1 && <span className="ml-1">x{count}</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Материалы не добавлены</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={() => navigate('/stands')} variant="outline" className="flex-1">
            Отменить
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={!number.trim() || !theme.trim() || isNumberTaken}
          >
            Добавить стенд
          </Button>
        </div>
      </div>

      <MaterialSelector
        open={showMaterialSelector}
        onClose={() => setShowMaterialSelector(false)}
        materials={materials}
        selectedMaterials={getCurrentShelfMaterials()}
        onMaterialToggle={handleMaterialToggle}
        shelfNumber={currentShelf || 1}
      />
    </div>
  );
}
