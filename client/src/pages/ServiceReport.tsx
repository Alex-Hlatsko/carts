import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Report, ResponsiblePerson } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function ServiceReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reports, updateItem } = useCollection<Report>('reports');
  const { data: responsiblePersons } = useCollection<ResponsiblePerson>('responsible-persons');
  const { showToast, ToastComponent } = useToast();

  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [servicedNotes, setServicedNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const report = reports.find(r => r.id === id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPersonId || !id) return;

    setIsSubmitting(true);

    const selectedPerson = responsiblePersons.find(p => p.id === selectedPersonId);
    if (!selectedPerson) {
      setIsSubmitting(false);
      return;
    }

    const updates = {
      isServiced: true,
      servicedBy: selectedPerson.name,
      servicedDate: new Date(),
      servicedNotes: servicedNotes.trim() || undefined
    };

    const result = await updateItem(id, updates);

    setIsSubmitting(false);

    if (result.success) {
      showToast('Отчёт успешно обслужен', 'success');
      navigate('/reports');
    } else {
      showToast('Ошибка при обслуживании отчёта', 'error');
    }
  };

  if (!report) {
    return (
      <div className="p-4">
        <div className="text-center">Отчёт не найден</div>
      </div>
    );
  }

  const issueAnswers = report.answers.filter(answer => !answer.answer || answer.notes);

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Обслуживание отчёта</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация об отчёте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Стенд:</span>
              <p className="text-lg">№{report.standNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Ответственный:</span>
              <p className="text-lg">{report.responsiblePersonName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Дата проверки:</span>
              <p className="text-lg">{formatDate(report.date)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Проблемы для исправления</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {issueAnswers.map((answer) => (
              <div key={answer.checklistItemId} className="border rounded p-4">
                <div className="flex items-start gap-3 mb-2">
                  {answer.answer ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{answer.question}</p>
                    <p className={`text-sm ${answer.answer ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.answer ? 'Да' : 'Нет'}
                    </p>
                  </div>
                </div>
                
                {answer.notes && (
                  <div className="mt-3 pl-8">
                    <span className="text-xs text-gray-600 font-medium">Замечания:</span>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">
                      {answer.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Информация об обслуживании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Кто обслужил</Label>
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
              </div>

              <div>
                <Label htmlFor="notes">Обслужил и исправил</Label>
                <Textarea
                  id="notes"
                  value={servicedNotes}
                  onChange={(e) => setServicedNotes(e.target.value)}
                  placeholder="Опишите выполненные работы и исправления"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !selectedPersonId}
          >
            {isSubmitting ? 'Подтверждение...' : 'Подтвердить обслуживание'}
          </Button>
        </form>
      </div>
    </div>
  );
}
