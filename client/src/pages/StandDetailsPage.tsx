import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRGenerator } from '@/components/QRGenerator';
import { ChecklistForm } from '@/components/ChecklistForm';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Report, ChecklistConfig } from '@/types';
import { ArrowLeft, Download, Upload, QrCode } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseInstances, isFirebaseInitialized } from '@/lib/firebase';

export function StandDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addDocument: addReport } = useCollection<Report>('reports');
  const { data: checklistConfigs } = useCollection<ChecklistConfig>('checklists');
  
  const [stand, setStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'receive' | 'issue' | null>(null);
  const [handledBy, setHandledBy] = useState('');
  const [handledTo, setHandledTo] = useState('');
  const [comments, setComments] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadStand(id);
    }
  }, [id]);

  const loadStand = async (standId: string) => {
    if (!isFirebaseInitialized()) {
      setError('Firebase не настроен');
      setLoading(false);
      return;
    }

    try {
      const { db } = getFirebaseInstances();
      const standDoc = await getDoc(doc(db, 'stands', standId));
      if (standDoc.exists()) {
        const data = standDoc.data();
        setStand({
          id: standDoc.id,
          ...data,
          dateAdded: data.dateAdded?.toDate() || new Date(),
        } as Stand);
      }
    } catch (error) {
      console.error('Error loading stand:', error);
      setError('Ошибка загрузки стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistSubmit = async (checklistResponses: Record<string, any>) => {
    if (!stand || !action || !handledBy.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const reportData: Omit<Report, 'id'> = {
        standId: stand.id,
        standName: stand.name,
        action,
        handledBy: handledBy.trim(),
        handledTo: action === 'issue' ? handledTo.trim() : undefined,
        timestamp: new Date(),
        comments: comments.trim(),
        checklist: checklistResponses,
      };

      await addReport(reportData);
      alert(`Стенд успешно ${action === 'receive' ? 'принят' : 'выдан'}!`);
      navigate('/');
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Ошибка при создании отчёта');
    }
  };

  const getDefaultChecklist = () => {
    return checklistConfigs.find(config => config.name === 'default') || {
      id: 'default',
      name: 'Стандартный чек-лист',
      items: [
        {
          id: '1',
          question: 'Стенд в хорошем состоянии?',
          type: 'boolean' as const,
          required: true,
        },
        {
          id: '2',
          question: 'Все материалы на месте?',
          type: 'boolean' as const,
          required: true,
        },
        {
          id: '3',
          question: 'Дополнительные комментарии',
          type: 'text' as const,
          required: false,
        },
      ],
      dateModified: new Date(),
    };
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/settings')}>
              Настроить Firebase
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Стенд не найден</h2>
            <Button onClick={() => navigate('/')}>Вернуться на главную</Button>
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
          <h1 className="text-2xl font-bold">{stand.name}</h1>
        </div>

        {!action && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация о стенде</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stand.imageUrl && (
                  <img
                    src={stand.imageUrl}
                    alt={stand.name}
                    className="w-full max-w-xs mx-auto rounded-lg aspect-[3/4] object-cover"
                  />
                )}
                
                <div>
                  <Label>Состояние</Label>
                  <p className="text-gray-700">{stand.condition}</p>
                </div>

                {stand.inventory.length > 0 && (
                  <div>
                    <Label>Инвентарь</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {stand.inventory.map(item => (
                        <span key={item} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Дата добавления</Label>
                  <p className="text-gray-700">{stand.dateAdded.toLocaleDateString('ru-RU')}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Button 
                size="lg" 
                className="h-16"
                onClick={() => setAction('receive')}
              >
                <Download className="h-6 w-6 mr-2" />
                Принять стенд
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16"
                onClick={() => setAction('issue')}
              >
                <Upload className="h-6 w-6 mr-2" />
                Выдать стенд
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-16"
                onClick={() => setShowQR(!showQR)}
              >
                <QrCode className="h-6 w-6 mr-2" />
                {showQR ? 'Скрыть QR-код' : 'Показать QR-код'}
              </Button>
            </div>

            {showQR && (
              <Card>
                <CardContent className="p-6 text-center">
                  <QRGenerator value={stand.id} size={200} />
                  <p className="text-sm text-gray-500 mt-2">QR-код для стенда</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {action && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {action === 'receive' ? 'Принять стенд' : 'Выдать стенд'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="handledBy">
                    {action === 'receive' ? 'Кто принимает' : 'Кто выдаёт'}
                  </Label>
                  <Input
                    id="handledBy"
                    value={handledBy}
                    onChange={(e) => setHandledBy(e.target.value)}
                    placeholder="Введите имя сотрудника"
                  />
                </div>

                {action === 'issue' && (
                  <div>
                    <Label htmlFor="handledTo">Кому выдаётся</Label>
                    <Input
                      id="handledTo"
                      value={handledTo}
                      onChange={(e) => setHandledTo(e.target.value)}
                      placeholder="Введите имя получателя"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="comments">Комментарии</Label>
                  <Input
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Дополнительные комментарии (необязательно)"
                  />
                </div>
              </CardContent>
            </Card>

            <ChecklistForm
              items={getDefaultChecklist().items}
              onSubmit={handleChecklistSubmit}
              onCancel={() => setAction(null)}
              title="Чек-лист проверки"
            />
          </div>
        )}
      </div>
    </div>
  );
}