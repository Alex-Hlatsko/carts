import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Responsible } from '@/types';

export function IssueStand() {
  const { standCode } = useParams<{ standCode: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem: updateStand } = useCollection<Stand>('stands');
  const { data: responsibles } = useCollection<Responsible>('responsibles', 'name');
  
  const [stand, setStand] = useState<Stand | null>(null);
  const [selectedResponsible, setSelectedResponsible] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundStand = stands.find(s => s.qrCode === standCode);
    setStand(foundStand || null);
  }, [stands, standCode]);

  const handleSubmit = async () => {
    if (!stand || !selectedResponsible || !recipientName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const success = await updateStand(stand.id, { 
        status: recipientName.trim() 
      });

      if (success) {
        setShowToast({ message: 'Стенд успешно выдан', type: 'success' });
        setTimeout(() => navigate('/scanner'), 1500);
      } else {
        throw new Error('Ошибка обновления стенда');
      }
    } catch (error) {
      setShowToast({ message: 'Ошибка при выдаче стенда', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stand) {
    return (
      <Layout 
        title="Выдача стенда" 
        showBackButton 
        onBack={() => navigate('/scanner')}
      >
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Стенд не найден</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="Выдача стенда" 
      showBackButton 
      onBack={() => navigate('/scanner')}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Стенд #{stand.number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><span className="font-medium">Тема:</span> {stand.theme}</p>
              <p><span className="font-medium">Текущий статус:</span> {stand.status}</p>
              <p><span className="font-medium">Дата:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Данные выдачи</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="responsible">Кто выдаёт</Label>
              <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите ответственного" />
                </SelectTrigger>
                <SelectContent>
                  {responsibles.map((responsible) => (
                    <SelectItem key={responsible.id} value={responsible.id}>
                      {responsible.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recipient">Кому выдаём</Label>
              <Input
                id="recipient"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Введите имя получателя"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!selectedResponsible || !recipientName.trim() || isSubmitting}
        >
          {isSubmitting ? 'Выдача...' : 'Выдать стенд'}
        </Button>
      </div>

      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
