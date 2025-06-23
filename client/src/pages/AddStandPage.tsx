import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ImageUpload';
import { useCollection } from '@/hooks/useFirestore';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Stand } from '@/types';
import { Save } from 'lucide-react';

export function AddStandPage() {
  const navigate = useNavigate();
  const { addDocument, error: firestoreError } = useCollection<Stand>('stands');
  const { uploadImage, uploading } = useImageUpload();
  
  const [formData, setFormData] = useState({
    number: '',
    name: '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!formData.number.trim()) {
      alert('Пожалуйста, введите номер стенда');
      return;
    }

    if (!formData.name.trim()) {
      alert('Пожалуйста, введите название стенда');
      return;
    }

    if (firestoreError) {
      alert('Ошибка: ' + firestoreError);
      return;
    }

    try {
      let imageUrl = '';
      
      if (selectedImage) {
        const url = await uploadImage(selectedImage, 'stands');
        if (url) imageUrl = url;
      }

      const standData: Omit<Stand, 'id'> = {
        ...formData,
        imageUrl,
        dateAdded: new Date(),
      };

      await addDocument(standData);
      navigate('/stands');
    } catch (error) {
      console.error('Error adding stand:', error);
      alert('Ошибка при добавлении стенда');
    }
  };

  if (firestoreError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка подключения</h2>
            <p className="text-muted-foreground mb-4">{firestoreError}</p>
            <Button onClick={() => navigate('/settings')}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Добавить стенд</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация о стенде</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="number">Номер стенда</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Введите номер стенда"
                />
              </div>

              <div>
                <Label htmlFor="name">Название стенда</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название стенда"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Изображение стенда</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload onImageSelect={setSelectedImage} />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={uploading}
          >
            <Save className="h-4 w-4 mr-2" />
            {uploading ? 'Сохранение...' : 'Сохранить стенд'}
          </Button>
        </div>
      </div>
    </div>
  );
}