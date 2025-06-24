import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BackButton } from '@/components/ui/back-button';
import { addReport } from '@/lib/firebase';

interface IssueFormProps {
  standCode: string;
  onBack: () => void;
  onComplete: () => void;
}

export function IssueForm({ standCode, onBack, onComplete }: IssueFormProps) {
  const [issuer, setIssuer] = React.useState<string>('');
  const [recipient, setRecipient] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);

  const responsibleOptions = [
    'Иванов И.И.',
    'Петров П.П.',
    'Сидоров С.С.'
  ];

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      await addReport({
        standCode,
        issuer,
        recipient,
        type: 'issue'
      });
      
      // Note: In real app, you'd update the stand status to recipient name
      
      alert('Стенд успешно выдан!');
      onComplete();
    } catch (error) {
      console.error('Error issuing stand:', error);
      alert('Ошибка при выдаче стенда');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Выдача стенда {standCode}</CardTitle>
          <p className="text-sm text-muted-foreground">
            Дата: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Кто выдаёт:</label>
            <Select value={issuer} onValueChange={setIssuer}>
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
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-card-foreground">Кому выдаётся:</label>
            <Input
              placeholder="Введите имя получателя"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          
          <Button 
            onClick={handleSubmit}
            className="w-full"
            disabled={!issuer || !recipient || loading}
          >
            {loading ? 'Выдача...' : 'Выдать стенд'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
