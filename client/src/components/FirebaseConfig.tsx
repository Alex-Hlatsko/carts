import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { configureFirebase, clearFirebaseConfig, isFirebaseInitialized } from '@/lib/firebase';
import { FirebaseConfig as FirebaseConfigType } from '@/types';
import { Save, Trash2, AlertTriangle, ExternalLink } from 'lucide-react';

export function FirebaseConfig() {
  const [config, setConfig] = useState<FirebaseConfigType>({
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
    } catch (error: any) {
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

  const updateConfig = (key: keyof FirebaseConfigType, value: string) => {
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
            <span className="text-sm text-muted-foreground">
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
          <Label htmlFor="storageBucket">Storage Bucket *</Label>
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

        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-red-500 mb-2">ВАЖНО: Настройка Firebase Storage</p>
              <p className="text-muted-foreground mb-3">
                Для работы загрузки изображений выполните следующие шаги:
              </p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-red-400 mb-1">1. Настройка Storage Rules:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs ml-3">
                    <li>Перейдите в <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="h-3 w-3" /></a></li>
                    <li>Storage → Rules</li>
                    <li>Замените правила на код ниже:</li>
                  </ol>
                  <pre className="bg-muted p-2 rounded text-xs mt-2 overflow-x-auto">
{`rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}`}
                  </pre>
                </div>

                <div>
                  <p className="font-medium text-red-400 mb-1">2. Настройка CORS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs ml-3">
                    <li>Откройте Google Cloud Console</li>
                    <li>Cloud Storage → Buckets → Ваш bucket</li>
                    <li>Permissions → Add Principal</li>
                    <li>New principals: <code className="bg-muted px-1 rounded">allUsers</code></li>
                    <li>Role: <code className="bg-muted px-1 rounded">Storage Object Viewer</code></li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">
                    Или через gsutil (если установлен):
                  </p>
                  <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
{`gsutil cors set cors.json gs://your-bucket-name`}
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    где cors.json содержит:
                  </p>
                  <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-x-auto">
{`[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT"],
    "maxAgeSeconds": 3600
  }
]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
          <p><strong>Как получить настройки Firebase:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Перейдите в <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Firebase Console <ExternalLink className="h-3 w-3" /></a></li>
            <li>Выберите или создайте проект</li>
            <li>Включите Firestore Database и Storage</li>
            <li>Перейдите в Project Settings (шестеренка)</li>
            <li>В разделе "Your apps" добавьте Web App</li>
            <li>Скопируйте конфигурацию из объекта firebaseConfig</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}