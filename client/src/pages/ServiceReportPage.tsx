import * as React from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Report, Responsible } from '@/types';

export function ServiceReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [servicedById, setServicedById] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: reports, update: updateReport } = useCollection<Report>('reports');
  const { data: responsibles } = useCollection<Responsible>('responsibles');
  const { toasts, removeToast, success, error } = useToast();

  const report = reports.find(r => r.id === id);

  const handleSubmit = async () => {
    if (!servicedById) {
      error('Выберите ответственного за обслуживание');
      return;
    }

    setIsSubmitting(true);

    try {
      const responsible = responsibles.find(r => r.id === servicedById);
      if (!responsible) {
        error('Ответственный не найден');
        return;
      }

      const updates = {
        isServiced: true,
        servicedBy: responsible.name,
        servicedDate: new Date(),
        serviceNotes: serviceNotes.trim() || undefined,
      };

      const result = await updateReport(id!, updates);
      if (result) {
        success('Отчёт помечен как обслуженный');
        navigate('/reports');
      } else {
        error('Ошибка при обновлении отчёта');
      }
    } catch (err) {
      error('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Отчёт не найден</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('ru-RU');
    }
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const issuesFound = report.answers.filter(answer => !answer.answer || answer.notes?.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Обслуживание стенда #{report.standNumber}</h2>
        <p className="text-muted-foreground">Отчёт от {formatDate(report.date)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Обнаруженные проблемы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {issuesFound.length === 0 ? (
            <p className="text-muted-foreground">Проблем не обнаружено</p>
          ) : (
            issuesFound.map((answer, index) => (
              <div key={answer.checklistItemId} className="border rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-medium mb-2">{answer.question}</p>
                    <Badge variant="destructive" className="mb-2">
                      {answer.answer ? 'Есть замечания' : 'Проблема'}
                    </Badge>
                    {answer.notes && (
                      <div className="mt-2 p-3 bg-muted rounded-md">
                        <span className="text-sm text-muted-foreground">Замечания:</span>
                        <p className="text-sm mt-1">{answer.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Обслуживание</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="servicedBy">Обслужил и исправил</Label>
            <Select value={servicedById} onValueChange={setServicedById}>
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
            <Label htmlFor="serviceNotes">Дополнительные замечания по обслуживанию</Label>
            <Textarea
              id="serviceNotes"
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="Опишите выполненные работы (необязательно)"
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !servicedById}
              className="flex-1"
            >
              {isSubmitting ? 'Сохранение...' : 'Подтвердить обслуживание'}
            </Button>
            <Button 
              onClick={() => navigate('/reports')} 
              variant="outline"
            >
              Отмена
            </Button>
          </div>
        </CardContent>
      </Card>

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
