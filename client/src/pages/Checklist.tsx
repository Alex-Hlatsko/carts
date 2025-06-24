import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, ChecklistItem, Responsible, Report, ChecklistAnswer } from '@/types';

export function Checklist() {
  const { standCode } = useParams<{ standCode: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem: updateStand } = useCollection<Stand>('stands');
  const { data: checklistItems } = useCollection<ChecklistItem>('checklistItems', 'order');
  const { data: responsibles } = useCollection<Responsible>('responsibles', 'name');
  const { addItem: addReport } = useCollection<Report>('reports');
  
  const [stand, setStand] = useState<Stand | null>(null);
  const [answers, setAnswers] = useState<ChecklistAnswer[]>([]);
  const [selectedResponsible, setSelectedResponsible] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundStand = stands.find(s => s.qrCode === standCode);
    setStand(foundStand || null);
  }, [stands, standCode]);

  useEffect(() => {
    if (checklistItems.length > 0) {
      setAnswers(checklistItems.map(item => ({
        questionId: item.id,
        question: item.question,
        answer: false,
        notes: ''
      })));
    }
  }, [checklistItems]);

  const updateAnswer = (questionId: string, field: 'answer' | 'notes', value: boolean | string) => {
    setAnswers(prev => prev.map(answer =>
      answer.questionId === questionId
        ? { ...answer, [field]: value }
        : answer
    ));
  };

  const handleSubmit = async () => {
    if (!stand || !selectedResponsible || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const responsible = responsibles.find(r => r.id === selectedResponsible);
      if (!responsible) throw new Error('Ответственный не найден');

      const report: Omit<Report, 'id'> = {
        standId: stand.id,
        standNumber: stand.number,
        responsibleId: responsible.id,
        responsibleName: responsible.name,
        date: new Date(),
        answers,
        isServiced: false,
        createdAt: new Date()
      };

      const reportSuccess = await addReport(report);
      if (!reportSuccess) throw new Error('Ошибка создания отчёта');

      const standSuccess = await updateStand(stand.id, { status: 'В зале' });
      if (!standSuccess) throw new Error('Ошибка обновления стенда');

      setShowToast({ message: 'Отчёт успешно отправлен', type: 'success' });
      setTimeout(() => navigate('/scanner'), 1500);
    } catch (error) {
      setShowToast({ message: 'Ошибка при отправке отчёта', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stand) {
    return (
      <Layout 
        title="Чек-лист" 
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
      title="Чек-лист приёмки" 
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
              <p><span className="font-medium">Дата:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ответственный</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Проверка</h3>
          {answers.map((answer, index) => (
            <Card key={answer.questionId}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`question-${answer.questionId}`}
                      checked={answer.answer}
                      onCheckedChange={(checked) => 
                        updateAnswer(answer.questionId, 'answer', checked === true)
                      }
                    />
                    <Label 
                      htmlFor={`question-${answer.questionId}`}
                      className="text-sm font-medium leading-relaxed"
                    >
                      {answer.question}
                    </Label>
                  </div>
                  <div>
                    <Label htmlFor={`notes-${answer.questionId}`} className="text-xs text-gray-600 dark:text-gray-400">
                      Дополнительные замечания
                    </Label>
                    <Input
                      id={`notes-${answer.questionId}`}
                      value={answer.notes}
                      onChange={(e) => updateAnswer(answer.questionId, 'notes', e.target.value)}
                      placeholder="Опишите замечания..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full"
          disabled={!selectedResponsible || isSubmitting}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отчёт'}
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
