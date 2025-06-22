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
import { ArrowLeft, Save } from 'lucide-react';

export function AddStandPage() {
  const navigate = useNavigate();
  const { addDocument, error: firestoreError } = useCollection<Stand>('stands');
  const { uploadImage, uploading } = useImageUpload();
  
  const [formData, setFormData] = useState({
    name: '',
    condition: 'Хорошее',
    inventory: [] as string[],
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [inventoryInput, setInventoryInput] = useState('');

  const handleSubmit = async () => {
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

  const addInventoryItem = () => {
    if (inventoryInput.trim() && !formData.inventory.includes(inventoryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        inventory: [...prev.inventory, inventoryInput.trim()]
      }));
      setInventoryInput('');
    }
  };

  const removeInventoryItem = (item: string) => {
    setFormData(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i !== item)
    }));
  };

  if (firestoreError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка подключения</h2>
            <p className="text-gray-600 mb-4">{firestoreError}</p>
            <Button onClick={() => navigate('/settings')}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Добавить стенд</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название стенда</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название стенда"
                />
              </div>

              <div>
                <Label htmlFor="condition">Состояние</Label>
                <Input
                  id="condition"
                  value={formData.condition}
                  onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="Состояние стенда"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Инвентарь</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  value={inventoryInput}
                  onChange={(e) => setInventoryInput(e.target.value)}
                  placeholder="Добавить предмет"
                  onKeyPress={(e) => e.key === 'Enter' && addInventoryItem()}
                />
                <Button onClick={addInventoryItem}>Добавить</Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.inventory.map(item => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm cursor-pointer hover:bg-red-100 hover:text-red-800"
                    onClick={() => removeInventoryItem(item)}
                  >
                    {item} ×
                  </span>
                ))}
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