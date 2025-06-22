import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChecklistEditor } from '@/components/ChecklistEditor';
import { FirebaseConfig } from '@/components/FirebaseConfig';
import { useCollection } from '@/hooks/useFirestore';
import { ChecklistConfig, ChecklistItem } from '@/types';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';

export function SettingsPage() {
  const navigate = useNavigate();
  const { data: checklistConfigs, addDocument, updateDocument, error } = useCollection<ChecklistConfig>('checklists');
  const [currentConfig, setCurrentConfig] = useState<ChecklistConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const defaultConfig = checklistConfigs.find(config => config.name === 'default');
    if (defaultConfig) {
      setCurrentConfig(defaultConfig);
    } else {
      // Create default config if it doesn't exist
      const newConfig: ChecklistConfig = {
        id: 'default',
        name: 'default',
        items: [
          {
            id: '1',
            question: 'Стенд в хорошем состоянии?',
            type: 'boolean',
            required: true,
          },
          {
            id: '2',
            question: 'Все материалы на месте?',
            type: 'boolean',
            required: true,
          },
          {
            id: '3',
            question: 'Дополнительные комментарии',
            type: 'text',
            required: false,
          },
        ],
        dateModified: new Date(),
      };
      setCurrentConfig(newConfig);
    }
  }, [checklistConfigs]);

  const handleChecklistChange = (items: ChecklistItem[]) => {
    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        items,
        dateModified: new Date(),
      });
      setHasChanges(true);
    }
  };

  const saveConfig = async () => {
    if (!currentConfig) return;

    try {
      const existingConfig = checklistConfigs.find(config => config.name === 'default');
      
      if (existingConfig) {
        await updateDocument(existingConfig.id, currentConfig);
      } else {
        await addDocument(currentConfig);
      }
      
      setHasChanges(false);
      alert('Чек-лист успешно сохранён!');
    } catch (error) {
      console.error('Error saving checklist config:', error);
      alert('Ошибка при сохранении чек-листа');
    }
  };

  const resetToDefault = () => {
    const defaultItems: ChecklistItem[] = [
      {
        id: '1',
        question: 'Стенд в хорошем состоянии?',
        type: 'boolean',
        required: true,
      },
      {
        id: '2',
        question: 'Все материалы на месте?',
        type: 'boolean',
        required: true,
      },
      {
        id: '3',
        question: 'Дополнительные комментарии',
        type: 'text',
        required: false,
      },
    ];

    if (currentConfig) {
      setCurrentConfig({
        ...currentConfig,
        items: defaultItems,
        dateModified: new Date(),
      });
      setHasChanges(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Настройки</h1>
        </div>

        <div className="space-y-6">
          <FirebaseConfig />

          {!error && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Редактирование чек-листа</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetToDefault}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Сбросить
                    </Button>
                    <Button onClick={saveConfig} disabled={!hasChanges}>
                      <Save className="h-4 w-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {currentConfig ? (
                  <ChecklistEditor
                    items={currentConfig.items}
                    onChange={handleChecklistChange}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка конфигурации...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}