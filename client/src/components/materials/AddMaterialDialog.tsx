import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addMaterial } from '@/lib/firebase';

interface AddMaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMaterialDialog({ open, onOpenChange }: AddMaterialDialogProps) {
  const [name, setName] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addMaterial(name, imageUrl);
      setName('');
      setImageUrl('');
      onOpenChange(false);
      window.location.reload(); // Простое обновление для демонстрации
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Ошибка при добавлении материала');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">Добавить материал</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-card-foreground">Название материала</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите название"
              required
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-card-foreground">Ссылка на изображение</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              type="url"
              required
              className="bg-input border-border text-foreground"
            />
          </div>
          
          {imageUrl && (
            <div className="space-y-2">
              <Label className="text-card-foreground">Предварительный просмотр:</Label>
              <div className="w-24 h-24 border border-border rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0zNSA0MEg2NVY2MEgzNVY0MFoiIGZpbGw9IiM2NjYiLz4KPC9zdmc+';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Добавление...' : 'Добавить'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
