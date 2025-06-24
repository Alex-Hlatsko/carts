import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, X } from 'lucide-react';
import { Material } from '../types';

interface ShelfSelectorProps {
  title: string;
  materials: Material[];
  selectedMaterials: Material[];
  onMaterialsChange: (materials: Material[]) => void;
}

export function ShelfSelector({ title, materials, selectedMaterials, onMaterialsChange }: ShelfSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleAddMaterial = (material: Material) => {
    onMaterialsChange([...selectedMaterials, material]);
    setIsOpen(false);
  };

  const handleRemoveMaterial = (index: number) => {
    const newMaterials = selectedMaterials.filter((_, i) => i !== index);
    onMaterialsChange(newMaterials);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Добавить материал
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden mx-4">
              <DialogHeader>
                <DialogTitle>Выберите материал для {title.toLowerCase()}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                {materials.map((material) => (
                  <Card key={material.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleAddMaterial(material)}>
                    <CardContent className="p-4">
                      <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                        <img
                          src={material.imageUrl}
                          alt={material.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium truncate text-center">{material.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {selectedMaterials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Материалы не добавлены</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {selectedMaterials.map((material, index) => (
              <div key={index} className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 z-10"
                  onClick={() => handleRemoveMaterial(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
                <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                  <img
                    src={material.imageUrl}
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs truncate text-center">{material.name}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
