import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, ChecklistItem, ResponsiblePerson, Report, ReportAnswer } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function ReceiveStand() {
  const { standId } = useParams<{ standId: string }>();
  const navigate = useNavigate();
  const { data: stands, updateItem } = useCollection<Stand>('stands');
  const { data: checklistItems } = useCollection<ChecklistItem>('checklist-items');
  const { data: responsiblePersons } = useCollection<ResponsiblePerson>('responsible-persons');
  const { addItem: addReport } = useCollection<Report>('reports');
  const { showToast, ToastComponent } = useToast();

  const [answers, setAnswers] = useState<{ [key: string]: { answer: boolean; notes: string } }>({});
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stand = stands.find(s => s.id === standId);
  const sortedChecklistItems = [...checklistItems].sort((a, b) => a.order - b.order);

  const handleAnswerChange = (itemId: string, answer: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        answer
      }
    }));
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !standId || !stand) return;

    setIsSubmitting(true);

    const selectedPerson = responsiblePersons.find(p => p.id === selectedPersonId);
    if (!selectedPerson) {
      setIsSubmitting(false);
      return;
    }

    // Создаем отчет
    const reportAnswers: ReportAnswer[] = sortedChecklistItems.map(item => ({
      checklistItemId: item.id,
      question: item.question,
      answer: answers[item.id]?.answer || false,
      notes: answers[item.id]?.notes || undefined
    }));

    const report: Omit<Report, 'id'> = {
      standId,
      standNumber: stand.number,
      responsiblePersonId: selectedPersonId,
      responsiblePersonName: selectedPerson.name,
      date: new Date(),
      answers: reportAnswers,
      isServiced: false
    };

    const reportResult = await addReport(report);

    // Обновляем статус стенда
    const standResult = await updateItem(standId, {
      status: 'В зале'
    });

    setIsSubmitting(false);

    if (reportResult.success && standResult.success) {
      showToast('Стенд успешно принят', 'success');
      navigate('/scanner');
    } else {
      showToast('Ошибка при приёме стенда', 'error');
    }
  };

  if (!stand) {
    return (
      <div className="p-4">
        <div className="text-center">Стенд не найден</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/scanner')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Принять стенд №{stand.number}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ответственное лицо</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
              <SelectContent>
                {responsiblePersons.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Чек-лист проверки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedChecklistItems.map((item) => (
              <div key={item.id} className="space-y-3 p-4 border rounded">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={answers[item.id]?.answer || false}
                    onCheckedChange={(checked) => 
                      handleAnswerChange(item.id, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <label className="text-sm font-medium">
                      {item.question}
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Дополнительные замечания:
                  </label>
                  <Textarea
                    value={answers[item.id]?.notes || ''}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Введите замечания (необязательно)"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || !selectedPersonId}
        >
          {isSubmitting ? 'Принимаем стенд...' : 'Принять стенд'}
        </Button>
      </form>
    </div>
  );
}
