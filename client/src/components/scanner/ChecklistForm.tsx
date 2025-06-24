import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackButton } from '@/components/ui/back-button';
import { addReport, updateStandStatus } from '@/lib/firebase';

interface ChecklistFormProps {
  standCode: string;
  onBack: () => void;
  onComplete: () => void;
}

export function ChecklistForm({ standCode, onBack, onComplete }: ChecklistFormProps) {
  const [checklist, setChecklist] = React.useState<Record<string, boolean>>({});
  const [comments, setComments] = React.useState<Record<string, string>>({});
  const [responsible, setResponsible] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const checklistItems = [
    'Все материалы на месте',
    'Стенд чистый',
    'Нет повреждений',
    'Правильное расположение материалов'
  ];

  const responsibleOptions = [
    'Иванов И.И.',
    'Петров П.П.',
    'Сидоров С.С.'
  ];

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const hasIssues = Object.values(checklist).some(value => !value) || 
                       Object.values(comments).some(comment => comment.trim() !== '');
      
      await addReport({
        standCode,
        checklist,
        comments,
        responsible,
        hasIssues,
        isServiced: false,
        type: 'acceptance'
      });
      
      // Update stand status to "В зале"
      // Note: In real app, you'd find the stand by standCode and update its status
      
      alert('Отчёт успешно отправлен!');
      onComplete();
    } catch (error) {
      console.error('Error submitting checklist:', error);
      alert('Ошибка при отправке отчёта');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Чек-лист для стенда {standCode}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Дата: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklistItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`item-${index}`}
                  checked={checklist[item] || false}
                  onCheckedChange={(checked) => 
                    setChecklist(prev => ({ ...prev, [item]: !!checked }))
                  }
                />
                <label htmlFor={`item-${index}`} className="text-sm text-card-foreground">
                  {item}
                </label>
              </div>
              <Textarea
                placeholder="Комментарий (если необходимо)"
                value={comments[item] || ''}
                onChange={(e) => 
                  setComments(prev => ({ ...prev, [item]: e.target.value }))
                }
                className="min-h-[60px] bg-input border-border text-foreground"
              />
            </div>
          ))}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Ответственный:</label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Выберите ответственного" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {responsibleOptions.map((option) => (
                  <SelectItem key={option} value={option} className="text-popover-foreground">
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!responsible || loading}
          >
            {loading ? 'Отправка...' : 'Отправить отчёт'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
