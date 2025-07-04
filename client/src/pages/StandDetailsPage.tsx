import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRGenerator } from '@/components/QRGenerator';
import { ChecklistForm } from '@/components/ChecklistForm';
import { StandVisualizer } from '@/components/StandVisualizer';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Report, ChecklistConfig, Material } from '@/types';
import { Download, Upload, QrCode, Trash2, Edit } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseInstances, isFirebaseInitialized } from '@/lib/firebase';

export function StandDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addDocument: addReport } = useCollection<Report>('reports');
  const { data: checklistConfigs } = useCollection<ChecklistConfig>('checklists');
  const { data: materials } = useCollection<Material>('materials');
  const { deleteDocument, updateDocument } = useCollection<Stand>('stands');
  
  const [stand, setStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'receive' | 'issue' | null>(null);
  const [handledBy, setHandledBy] = useState('');
  const [handledTo, setHandledTo] = useState('');
  const [comments, setComments] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
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

  const handleDeleteStand = async () => {
    if (!stand) return;
    
    if (confirm(`Вы уверены, что хотите удалить стенд "${stand.number} - ${stand.theme}"?`)) {
      try {
        await deleteDocument(stand.id);
        alert('Стенд успешно удалён');
        navigate('/stands');
      } catch (error) {
        console.error('Error deleting stand:', error);
        alert('Ошибка при удалении стенда');
      }
    }
  };

  const handleUpdateStatus = async () => {
    if (!stand || !newStatus.trim()) return;

    try {
      await updateDocument(stand.id, { status: newStatus.trim() });
      setStand({ ...stand, status: newStatus.trim() });
      setEditingStatus(false);
      setNewStatus('');
      alert('Статус обновлён');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleChecklistSubmit = async (checklistResponses: Record<string, any>) => {
    if (!stand || !handledBy.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const reportData: Omit<Report, 'id'> = {
        standId: stand.id,
        standName: `#${stand.number} - ${stand.theme}`,
        action: 'receive',
        handledBy: handledBy.trim(),
        timestamp: new Date(),
        comments: comments.trim(),
        checklist: checklistResponses,
      };

      await addReport(reportData);
      
      // Update stand status to "В Зале Царства"
      await updateDocument(stand.id, { status: 'В Зале Царства' });
      setStand({ ...stand, status: 'В Зале Царства' });
      
      alert('Стенд успешно принят!');
      navigate('/');
    } catch (error) {
      console.error('Error creating report:', error);
      alert('Ошибка при создании отчёта');
    }
  };

  const handleIssueStand = async () => {
    if (!stand || !handledBy.trim() || !handledTo.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    try {
      const reportData: Omit<Report, 'id'> = {
        standId: stand.id,
        standName: `#${stand.number} - ${stand.theme}`,
        action: 'issue',
        handledBy: handledBy.trim(),
        handledTo: handledTo.trim(),
        timestamp: new Date(),
        comments: comments.trim(),
      };

      await addReport(reportData);
      
      // Update stand status to the person who received it
      await updateDocument(stand.id, { status: handledTo.trim() });
      setStand({ ...stand, status: handledTo.trim() });
      
      alert('Стенд успешно выдан!');
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Ошибка</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Проверьте настройки Firebase в файле client/src/lib/firebase.ts
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-primary">#{stand.number}</span> - {stand.theme}
          </h1>
          <Button
            variant="destructive"
            onClick={handleDeleteStand}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить стенд
          </Button>
        </div>

        {!action && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Информация о стенде</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Номер стенда</Label>
                    <p className="text-foreground font-mono text-lg">#{stand.number}</p>
                  </div>

                  <div>
                    <Label>Тема</Label>
                    <p className="text-foreground">{stand.theme}</p>
                  </div>

                  <div>
                    <Label>Статус</Label>
                    {editingStatus ? (
                      <div className="flex gap-2">
                        <Input
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          placeholder="Введите новый статус..."
                        />
                        <Button size="sm" onClick={handleUpdateStatus}>
                          Сохранить
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingStatus(false)}>
                          Отмена
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <p className="text-foreground">{stand.status}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingStatus(true);
                            setNewStatus(stand.status);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Дата добавления</Label>
                    <p className="text-foreground">{stand.dateAdded.toLocaleDateString('ru-RU')}</p>
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
                    <p className="text-sm text-muted-foreground mt-2">QR-код для стенда</p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              <StandVisualizer stand={stand} materials={materials} />
            </div>
          </div>
        )}

        {action === 'receive' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Принять стенд</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="handledBy">Кто принимает</Label>
                  <Input
                    id="handledBy"
                    value={handledBy}
                    onChange={(e) => setHandledBy(e.target.value)}
                    placeholder="Введите имя сотрудника"
                  />
                </div>

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

        {action === 'issue' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Выдать стенд</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="handledBy">Кто выдаёт</Label>
                  <Input
                    id="handledBy"
                    value={handledBy}
                    onChange={(e) => setHandledBy(e.target.value)}
                    placeholder="Введите имя сотрудника"
                  />
                </div>

                <div>
                  <Label htmlFor="handledTo">Кому выдаётся</Label>
                  <Input
                    id="handledTo"
                    value={handledTo}
                    onChange={(e) => setHandledTo(e.target.value)}
                    placeholder="Введите имя получателя"
                  />
                </div>

                <div>
                  <Label htmlFor="comments">Комментарии</Label>
                  <Input
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Дополнительные комментарии (необязательно)"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleIssueStand} className="flex-1">
                    Выдать стенд
                  </Button>
                  <Button variant="outline" onClick={() => setAction(null)} className="flex-1">
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}