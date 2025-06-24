import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { getMaterials } from '@/lib/firebase';

interface Material {
  id: string;
  name: string;
  imageUrl: string;
}

interface ShelfMaterialsProps {
  shelfNumber: number;
  materials: string[];
  onMaterialsChange: (materials: string[]) => void;
}

export function ShelfMaterials({ shelfNumber, materials, onMaterialsChange }: ShelfMaterialsProps) {
  const [selectedMaterial, setSelectedMaterial] = React.useState('');
  const [availableMaterials, setAvailableMaterials] = React.useState<Material[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await getMaterials();
        setAvailableMaterials(data as Material[]);
      } catch (error) {
        console.error('Error loading materials:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, []);

  const addMaterial = () => {
    if (selectedMaterial) {
      onMaterialsChange([...materials, selectedMaterial]);
      setSelectedMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    onMaterialsChange(materials.filter((_, i) => i !== index));
  };

  const getMaterialData = (materialName: string) => {
    return availableMaterials.find(m => m.name === materialName);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Полка {shelfNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger className="flex-1 bg-input border-border text-foreground">
              <SelectValue placeholder={loading ? "Загрузка..." : "Выберите материал"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {availableMaterials.map((material) => (
                <SelectItem key={material.id} value={material.name} className="text-popover-foreground">
                  {material.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addMaterial} disabled={!selectedMaterial || loading}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {materials.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Материалы на полке:</h4>
            {materials.map((materialName, index) => {
              const materialData = getMaterialData(materialName);
              return (
                <div key={index} className="flex items-center justify-between bg-muted p-3 rounded border border-border">
                  <div className="flex items-center gap-3">
                    {materialData && (
                      <div className="w-10 h-10 rounded overflow-hidden border border-border">
                        <img
                          src={materialData.imageUrl}
                          alt={materialData.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xNCAxNkgyNlYyNEgxNFYxNloiIGZpbGw9IiM2NjYiLz4KPC9zdmc+';
                          }}
                        />
                      </div>
                    )}
                    <span className="text-sm text-card-foreground">{materialName}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMaterial(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
