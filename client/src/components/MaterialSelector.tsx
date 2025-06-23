import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Material } from '@/types';
import { Plus, Search, X } from 'lucide-react';

interface MaterialSelectorProps {
  selectedMaterials: string[];
  availableMaterials: Material[];
  onSelectionChange: (materialIds: string[]) => void;
}

export function MaterialSelector({ selectedMaterials, availableMaterials, onSelectionChange }: MaterialSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelector, setShowSelector] = useState(false);

  const filteredMaterials = availableMaterials.filter(material =>
    material.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMaterials.includes(material.id)
  );

  const selectedMaterialsData = availableMaterials.filter(material =>
    selectedMaterials.includes(material.id)
  );

  const addMaterial = (materialId: string) => {
    onSelectionChange([...selectedMaterials, materialId]);
    setSearchTerm('');
  };

  const removeMaterial = (materialId: string) => {
    onSelectionChange(selectedMaterials.filter(id => id !== materialId));
  };

  return (
    <div className="space-y-4">
      {/* Selected Materials */}
      {selectedMaterialsData.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {selectedMaterialsData.map(material => (
            <Card key={material.id} className="relative overflow-hidden">
              <CardContent className="p-2">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-20 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04Ny4yIDk2LjhWODEuNkg4MC44VjY4LjhIODcuMlY1My42SDEwMC44VjY4LjhIMTA3LjJWODEuNkgxMDAuOFY5Ni44SDg3LjJaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5ObyBpbWFnZTwvdGV4dD4KPHN2Zz4=';
                  }}
                />
                <p className="text-xs mt-1 font-medium line-clamp-2">{material.name}</p>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 h-5 w-5"
                  onClick={() => removeMaterial(material.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Material Button */}
      <Button
        variant="outline"
        onClick={() => setShowSelector(!showSelector)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Добавить материал на полку
      </Button>

      {/* Material Selector */}
      {showSelector && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск материалов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {filteredMaterials.map(material => (
                  <Card key={material.id} className="cursor-pointer hover:bg-accent transition-colors">
                    <CardContent className="p-2" onClick={() => addMaterial(material.id)}>
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-full h-20 object-cover rounded mb-2"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04Ny4yIDk2LjhWODEuNkg4MC44VjY4LjhIODcuMlY1My42SDEwMC44VjY4LjhIMTA3LjJWODEuNkgxMDAuOFY5Ni44SDg3LjJaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5ObyBpbWFnZTwvdGV4dD4KPHN2Zz4=';
                        }}
                      />
                      <p className="text-xs font-medium line-clamp-2">{material.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredMaterials.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  {searchTerm ? 'Материалы не найдены' : 'Все материалы уже добавлены'}
                </p>
              )}

              <Button
                variant="outline"
                onClick={() => setShowSelector(false)}
                className="w-full"
              >
                Закрыть
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}