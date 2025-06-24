import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Material } from '@/types';
import { Check } from 'lucide-react';

interface MaterialSelectorProps {
  open: boolean;
  onClose: () => void;
  materials: Material[];
  selectedMaterials: Material[];
  onMaterialToggle: (material: Material) => void;
  shelfNumber: number;
}

export function MaterialSelector({
  open,
  onClose,
  materials,
  selectedMaterials,
  onMaterialToggle,
  shelfNumber
}: MaterialSelectorProps) {
  const isSelected = React.useCallback((material: Material) => {
    return selectedMaterials.some(selected => selected.id === material.id);
  }, [selectedMaterials]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Выберите материалы для полки {shelfNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Выбрано:</span>
            <Badge variant="secondary">{selectedMaterials.length}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {materials.map(material => {
              const selected = isSelected(material);
              
              return (
                <Card 
                  key={material.id}
                  className={`cursor-pointer transition-all ${
                    selected ? 'ring-2 ring-primary' : 'hover:shadow-md'
                  }`}
                  onClick={() => onMaterialToggle(material)}
                >
                  <CardContent className="p-3">
                    <div className="relative">
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-full h-20 object-cover rounded-md mb-2"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="80"><rect width="100" height="80" fill="%23ddd"/><text y="45" x="50" text-anchor="middle" dy=".3em" font-size="12">Нет фото</text></svg>';
                        }}
                      />
                      {selected && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-center">{material.name}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {materials.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Материалы не найдены</p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Готово
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
