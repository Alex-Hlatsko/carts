import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImageUrl?: string;
  className?: string;
}

export function ImageUpload({ onImageSelect, currentImageUrl, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Размер файла не должен превышать 10MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      onImageSelect(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    // Reset the input
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full max-w-xs mx-auto rounded-lg h-80 object-cover border-2 border-border"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 text-center">
              <p className="text-xs text-muted-foreground">
                Изображение будет автоматически оптимизировано для загрузки
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Выберите изображение стенда
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Рекомендуется вертикальное изображение (как башня)<br/>
              Максимальный размер: 10MB
            </p>
            <label htmlFor="image-upload">
              <Button asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Выбрать файл
                </span>
              </Button>
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}