import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Material, Shelf } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { Plus, ArrowLeft, Package, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AddStand() {
  const navigate = useNavigate();
  const [standForm, setStandForm] = useState({
    number: '',
    theme: ''
  });
  const [shelves, setShelves] = useState<Shelf[]>([
    { id: '1', materials: [] },
    { id: '2', materials: [] },
    { id: '3', materials: [] }
  ]);
  const [showMaterialsDialog, setShowMaterialsDialog] = useState(false);
  const [selectedShelfId, setSelectedShelfId] = useState('');

  const { data: materials } = useCollection<Material>('materials');
  const { add: addStand } = useCollection<Stand>('stands');
  const { toast, showToast, hideToast } = useToast();

  const handleAddMaterialToShelf = (material: Material) => {
    setShelves(prev => prev.map(shelf => 
      shelf.id === selectedShelfId 
        ? { ...shelf, materials: [...shelf.materials, material] }
        : shelf
    ));
    setShowMaterialsDialog(false);
  };

  const handleRemoveMaterialFromShelf = (shelfId: string, materialIndex: number) => {
    setShelves(prev => prev.map(shelf => 
      shelf.id === shelfId 
        ? { ...shelf, materials: shelf.materials.filter((_, index) => index !== materialIndex) }
        : shelf
    ));
  };

  const handleSubmit = async () => {
    if (!standForm.number || !standForm.theme) {
      showToast('Заполните все поля', 'error');
      return;
    }

    const newStand: Omit<Stand, 'id'> = {
      number: standForm.number,
      theme: standForm.theme,
      status: 'В Зале Царства',
      shelves: shelves,
      createdAt: new Date()
    };

    const result = await addStand(newStand);
    if (result.success) {
      showToast('Стенд успешно добавлен', 'success');
      setTimeout(() => {
        navigate('/stands');
      }, 1500);
    } else {
      showToast('Ошибка при добавлении стенда', 'error');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mr-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold">Добавить стенд</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="number">Номер стенда</Label>
              <Input
                id="number"
                value={standForm.number}
                onChange={(e) => setStandForm(prev => ({ ...prev, number: e.target.value }))}
                placeholder="Введите номер стенда"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="theme">Тема стенда</Label>
              <Input
                id="theme"
                value={standForm.theme}
                onChange={(e) => setStandForm(prev => ({ ...prev, theme: e.target.value }))}
                placeholder="Введите тему стенда"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Полки стенда</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shelves.map((shelf, shelfIndex) => (
                <div key={shelf.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">Полка {shelfIndex + 1}</h3>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedShelfId(shelf.id);
                        setShowMaterialsDialog(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Добавить материал
                    </Button>
                  </div>
                  
                  {shelf.materials.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-2" />
                      <p>Полка пуста</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {shelf.materials.map((material, materialIndex) => (
                        <div key={`${material.id}-${materialIndex}`} className="relative">
                          <div className="aspect-square bg-gray-100 rounded overflow-hidden">
                            <img 
                              src={material.imageUrl} 
                              alt={material.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                          <p className="text-xs mt-1 truncate">{material.name}</p>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => handleRemoveMaterialFromShelf(shelf.id, materialIndex)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} size="lg">
            Создать стенд
          </Button>
        </div>
      </div>

      <Dialog open={showMaterialsDialog} onOpenChange={setShowMaterialsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Выберите материал</DialogTitle>
            <DialogDescription>
              Нажмите на материал, чтобы добавить его на полку
            </DialogDescription>
          </DialogHeader>
          
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Нет доступных материалов. Добавьте материалы в разделе "Материалы".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {materials.map((material) => (
                <div 
                  key={material.id}
                  className="cursor-pointer border rounded-lg p-2 hover:border-primary transition-colors"
                  onClick={() => handleAddMaterialToShelf(material)}
                >
                  <div className="aspect-square bg-gray-100 rounded overflow-hidden mb-2">
                    <img 
                      src={material.imageUrl} 
                      alt={material.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <p className="text-sm font-medium truncate">{material.name}</p>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaterialsDialog(false)}>
              Закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
}
