import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stand, ResponsiblePerson } from '@/types';

interface GiveOutFormProps {
  open: boolean;
  onClose: () => void;
  stand: Stand | null;
  responsiblePersons: ResponsiblePerson[];
  onSubmit: (data: {
    responsiblePerson: string;
    recipientName: string;
  }) => void;
}

export function GiveOutForm({
  open,
  onClose,
  stand,
  responsiblePersons,
  onSubmit
}: GiveOutFormProps) {
  const [responsiblePerson, setResponsiblePerson] = React.useState('');
  const [recipientName, setRecipientName] = React.useState('');

  const handleSubmit = React.useCallback(() => {
    if (!responsiblePerson || !recipientName) return;

    onSubmit({
      responsiblePerson,
      recipientName
    });

    setResponsiblePerson('');
    setRecipientName('');
  }, [responsiblePerson, recipientName, onSubmit]);

  if (!stand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Выдача стенда #{stand.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Кто выдаёт</Label>
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

          <div>
            <Label>Кому выдаём</Label>
            <Input
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Введите имя получателя"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Отменить
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!responsiblePerson || !recipientName}
            >
              Выдать стенд
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
