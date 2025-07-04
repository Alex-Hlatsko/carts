import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stand, Material } from '@/types';

interface StandVisualizerProps {
  stand: Stand;
  materials: Material[];
  className?: string;
}

export function StandVisualizer({ stand, materials, className }: StandVisualizerProps) {
  const getMaterialsForShelf = (shelfNumber: number) => {
    const shelf = stand.shelves.find(s => s.number === shelfNumber);
    if (!shelf) return [];
    
    return shelf.materials
      .map(materialId => materials.find(m => m.id === materialId))
      .filter(Boolean) as Material[];
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center pb-3">
        <CardTitle className="text-lg">
          <span className="text-primary">#{stand.number}</span> - {stand.theme}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Статус: {stand.status}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {[1, 2, 3].map(shelfNumber => {
          const shelfMaterials = getMaterialsForShelf(shelfNumber);
          
          return (
            <div key={shelfNumber} className="border rounded-lg p-3 bg-muted/30">
              <h4 className="font-medium mb-2 text-center">Полка {shelfNumber}</h4>
              {shelfMaterials.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {shelfMaterials.map((material, index) => (
                    <div key={`${material.id}-${index}`} className="text-center">
                      <img
                        src={material.imageUrl}
                        alt={material.name}
                        className="w-full h-16 object-cover rounded mb-1"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04Ny4yIDk2LjhWODEuNkg4MC44VjY4LjhIODcuMlY1My42SDEwMC44VjY4LjhIMTA3LjJWODEuNkgxMDAuOFY5Ni44SDg3LjJaIiBmaWxsPSIjOUNBM0FGIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUNBM0FGIiBmb250LXNpemU9IjEyIj5ObyBpbWFnZTwvdGV4dD4KPHN2Zz4=';
                        }}
                      />
                      <p className="text-xs font-medium line-clamp-2">{material.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-4">
                  Полка пустая
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}