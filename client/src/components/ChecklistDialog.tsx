import * as React from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection } from '@/hooks/useFirestore';
import { ChecklistItem, Responsible, Report, ReportAnswer, Stand } from '@/types';

interface ChecklistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stand: Stand;
  onComplete: (message: string) => void;
}

export function ChecklistDialog({ isOpen, onClose, stand, onComplete }: ChecklistDialogProps) {
  const [responsibleId, setResponsibleId] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: { answer: boolean; notes: string } }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: checklistItems } = useCollection<ChecklistItem>('checklist');
  const { data: responsibles } = useCollection<Responsible>('responsibles');
  const { add: addReport } = useCollection<Report>('reports');

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

  const handleSubmit = async () => {
    if (!responsibleId) {
      onComplete('Выберите ответственного');
      return;
    }

    setIsSubmitting(true);

    try {
      const responsible = responsibles.find(r => r.id === responsibleId);
      if (!responsible) {
        onComplete('Ответственный не найден');
        return;
      }

      const reportAnswers: ReportAnswer[] = checklistItems.map(item => ({
        checklistItemId: item.id,
        question: item.question,
        answer: answers[item.id]?.answer || false,
        notes: answers[item.id]?.notes || ''
      }));

      const report: Omit<Report, 'id'> = {
        standId: stand.id,
        standNumber: stand.number,
        responsibleId: responsible.id,
        responsibleName: responsible.name,
        date: new Date(),
        answers: reportAnswers,
        isServiced: false,
      };

      const result = await addReport(report);
      if (result) {
        onComplete('Отчёт успешно отправлен');
        onClose();
      } else {
        onComplete('Ошибка при отправке отчёта');
      }
    } catch (error) {
      onComplete('Произошла ошибка при отправке отчёта');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setResponsibleId('');
    setAnswers({});
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Чек-лист для стенда #{stand.number}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="responsible">Ответственный</Label>
            <Select value={responsibleId} onValueChange={setResponsibleId}>
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
            <p className="text-sm text-muted-foreground mb-4">
              Дата: {new Date().toLocaleDateString('ru-RU')}
            </p>
          </div>

          {checklistItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Нет пунктов чек-листа. Добавьте пункты в настройках.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {checklistItems.map((item, index) => (
                <div key={item.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-muted-foreground mt-1">#{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{item.question}</p>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.id}-yes`}
                            checked={answers[item.id]?.answer === true}
                            onCheckedChange={() => handleAnswerChange(item.id, true)}
                          />
                          <Label htmlFor={`${item.id}-yes`} className="text-green-600">Да</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`${item.id}-no`}
                            checked={answers[item.id]?.answer === false && answers[item.id]?.answer !== undefined}
                            onCheckedChange={() => handleAnswerChange(item.id, false)}
                          />
                          <Label htmlFor={`${item.id}-no`} className="text-red-600">Нет</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor={`${item.id}-notes`} className="text-sm">Дополнительные замечания</Label>
                    <Textarea
                      id={`${item.id}-notes`}
                      value={answers[item.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(item.id, e.target.value)}
                      placeholder="Введите замечания (необязательно)"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !responsibleId || checklistItems.length === 0}
              className="flex-1"
            >
              {isSubmitting ? 'Отправка...' : 'Отправить отчёт'}
            </Button>
            <Button onClick={handleClose} variant="outline">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
