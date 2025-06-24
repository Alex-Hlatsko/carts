import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Report, ResponsiblePerson } from '@/types';

interface ServiceDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
  responsiblePersons: ResponsiblePerson[];
  onSubmit: (data: {
    servicedBy: string;
    serviceNotes: string;
  }) => void;
}

export function ServiceDialog({
  open,
  onClose,
  report,
  responsiblePersons,
  onSubmit
}: ServiceDialogProps) {
  const [servicedBy, setServicedBy] = React.useState('');
  const [serviceNotes, setServiceNotes] = React.useState('');

  const handleSubmit = React.useCallback(() => {
    if (!servicedBy) return;

    onSubmit({
      servicedBy,
      serviceNotes: serviceNotes.trim()
    });

    setServicedBy('');
    setServiceNotes('');
  }, [servicedBy, serviceNotes, onSubmit]);

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Обслуживание стенда #{report.standNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Кто обслужил</Label>
            <Select value={servicedBy} onValueChange={setServicedBy}>
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
            <Label>Обслужил и исправил</Label>
            <Textarea
              value={serviceNotes}
              onChange={(e) => setServiceNotes(e.target.value)}
              placeholder="Опишите выполненные работы..."
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Отменить
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!servicedBy}
            >
              Подтвердить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
