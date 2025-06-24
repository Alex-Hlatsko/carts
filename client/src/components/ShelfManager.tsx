import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { Shelf, Material } from '@/types';
import { Package, Plus, X } from 'lucide-react';

interface ShelfManagerProps {
  shelf: Shelf;
  onUpdate: (shelf: Shelf) => void;
}

export function ShelfManager({ shelf, onUpdate }: ShelfManagerProps) {
  const [isSelectingMaterial, setIsSelectingMaterial] = useState(false);
  const { data: materials } = useCollection<Material>('materials');

  const addMaterial = (material: Material) => {
    const updatedShelf = {
      ...shelf,
      materials: [...shelf.materials, material],
    };
    onUpdate(updatedShelf);
    setIsSelectingMaterial(false);
  };

  const removeMaterial = (index: number) => {
    const updatedShelf = {
      ...shelf,
      materials: shelf.materials.filter((_, i) => i !== index),
    };
    onUpdate(updatedShelf);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className="h-4 w-4" />
          Полка {shelf.position}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {shelf.materials.map((material, index) => (
            <div key={`${material.id}-${index}`} className="relative group">
              <div className="aspect-square bg-muted rounded-md overflow-hidden">
                <img
                  src={material.imageUrl}
                  alt={material.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-image.png';
                  }}
                />
              </div>
              <Button
                onClick={() => removeMaterial(index)}
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-xs text-center mt-1 truncate">{material.name}</p>
            </div>
          ))}
          
          <Dialog open={isSelectingMaterial} onOpenChange={setIsSelectingMaterial}>
            <DialogTrigger asChild>
              <div className="aspect-square bg-muted rounded-md border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Выберите материал для полки {shelf.position}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => addMaterial(material)}
                    className="cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors"
                  >
                    <div className="aspect-square bg-muted rounded-md overflow-hidden mb-2">
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.png';
                        }}
                      />
                    </div>
                    <p className="text-xs text-center truncate">{material.name}</p>
                  </div>
                ))}
              </div>
              {materials.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Нет доступных материалов. Добавьте материалы в разделе "Материалы".
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Материалов на полке: {shelf.materials.length}
        </p>
      </CardContent>
    </Card>
  );
}
