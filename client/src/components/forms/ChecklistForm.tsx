import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, ChecklistItem, ResponsiblePerson } from '@/types';

interface ChecklistFormProps {
  open: boolean;
  onClose: () => void;
  stand: Stand | null;
  checklistItems: ChecklistItem[];
  responsiblePersons: ResponsiblePerson[];
  onSubmit: (data: {
    responsiblePerson: string;
    answers: { checklistItemId: string; answer: boolean; notes?: string }[];
  }) => void;
}

export function ChecklistForm({
  open,
  onClose,
  stand,
  checklistItems,
  responsiblePersons,
  onSubmit
}: ChecklistFormProps) {
  const [responsiblePerson, setResponsiblePerson] = React.useState('');
  const [answers, setAnswers] = React.useState<Record<string, { answer: boolean; notes: string }>>({});

  const handleAnswerChange = React.useCallback((itemId: string, answer: boolean) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], answer }
    }));
  }, []);

  const handleNotesChange = React.useCallback((itemId: string, notes: string) => {
    setAnswers(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes }
    }));
  }, []);

  const handleSubmit = React.useCallback(() => {
    if (!responsiblePerson) return;

    const formattedAnswers = checklistItems.map(item => ({
      checklistItemId: item.id,
      answer: answers[item.id]?.answer || false,
      notes: answers[item.id]?.notes || undefined
    }));

    onSubmit({
      responsiblePerson,
      answers: formattedAnswers
    });

    setResponsiblePerson('');
    setAnswers({});
  }, [responsiblePerson, answers, checklistItems, onSubmit]);

  if (!stand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Чек-лист для стенда #{stand.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label>Ответственный</Label>
            <Select value={responsiblePerson} onValueChange={setResponsiblePerson}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
              <SelectContent>
                {responsiblePersons.map(person => (
                  <SelectItem key={person.id} value={person.name}>
                    {person.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {checklistItems.map(item => (
              <div key={item.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={answers[item.id]?.answer || false}
                    onCheckedChange={(checked) => 
                      handleAnswerChange(item.id, checked as boolean)
                    }
                  />
                  <Label className="text-sm">{item.question}</Label>
                </div>
                <Input
                  placeholder="Дополнительные заметки..."
                  value={answers[item.id]?.notes || ''}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Отменить
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!responsiblePerson}
            >
              Отправить отчёт
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
