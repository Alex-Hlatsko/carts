import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { configureFirebase, clearFirebaseConfig, isFirebaseInitialized } from '@/lib/firebase';
import { Save, Trash2 } from 'lucide-react';

export function FirebaseConfig() {
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: "AIzaSyBB0dOHC8-nA6c6fGWglFQRR8pdCs-LAic",
  authDomain: "jwcarts-82c8f.firebaseapp.com",
  projectId: "jwcarts-82c8f",
  storageBucket: "jwcarts-82c8f.firebasestorage.app",
  messagingSenderId: "602423977795",
  appId: "1:602423977795:web:c61436084821d5c24af1f6",
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isFirebaseInitialized());
    
    // Load stored config
    const stored = localStorage.getItem('firebaseConfig');
    if (stored) {
      try {
        setConfig(JSON.parse(stored));
      } catch (e) {
        console.warn('Failed to parse stored Firebase config');
      }
    }
  }, []);

  const handleSave = async () => {
    if (!config.apiKey || !config.projectId) {
      alert('Пожалуйста, заполните обязательные поля (API Key и Project ID)');
      return;
    }

    try {
      configureFirebase(config);
      setIsConnected(true);
      alert('Firebase успешно настроен!');
    } catch (error) {
      console.error('Firebase configuration error:', error);
      alert('Ошибка настройки Firebase: ' + error.message);
    }
  };

  const handleClear = () => {
    if (confirm('Вы уверены, что хотите удалить конфигурацию Firebase?')) {
      clearFirebaseConfig();
      setConfig({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
      setIsConnected(false);
      alert('Конфигурация Firebase удалена');
    }
  };

  const updateConfig = (key: keyof FirebaseConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Настройка Firebase</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Подключено' : 'Не подключено'}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="apiKey">API Key *</Label>
          <Input
            id="apiKey"
            type="password"
            value={config.apiKey}
            onChange={(e) => updateConfig('apiKey', e.target.value)}
            placeholder="Введите API Key"
          />
        </div>

        <div>
          <Label htmlFor="authDomain">Auth Domain</Label>
          <Input
            id="authDomain"
            value={config.authDomain}
            onChange={(e) => updateConfig('authDomain', e.target.value)}
            placeholder="your-project.firebaseapp.com"
          />
        </div>

        <div>
          <Label htmlFor="projectId">Project ID *</Label>
          <Input
            id="projectId"
            value={config.projectId}
            onChange={(e) => updateConfig('projectId', e.target.value)}
            placeholder="your-project-id"
          />
        </div>

        <div>
          <Label htmlFor="storageBucket">Storage Bucket</Label>
          <Input
            id="storageBucket"
            value={config.storageBucket}
            onChange={(e) => updateConfig('storageBucket', e.target.value)}
            placeholder="your-project.appspot.com"
          />
        </div>

        <div>
          <Label htmlFor="messagingSenderId">Messaging Sender ID</Label>
          <Input
            id="messagingSenderId"
            value={config.messagingSenderId}
            onChange={(e) => updateConfig('messagingSenderId', e.target.value)}
            placeholder="123456789"
          />
        </div>

        <div>
          <Label htmlFor="appId">App ID</Label>
          <Input
            id="appId"
            value={config.appId}
            onChange={(e) => updateConfig('appId', e.target.value)}
            placeholder="1:123456789:web:abcdef"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Сохранить
          </Button>
          <Button variant="outline" onClick={handleClear} disabled={!isConnected}>
            <Trash2 className="h-4 w-4 mr-2" />
            Очистить
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
          <p><strong>Как получить настройки Firebase:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Перейдите в <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a></li>
            <li>Выберите или создайте проект</li>
            <li>Перейдите в Project Settings (шестеренка)</li>
            <li>В разделе "Your apps" добавьте Web App</li>
            <li>Скопируйте конфигурацию из объекта firebaseConfig</li>
            <li>Включите Firestore Database и Storage</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}