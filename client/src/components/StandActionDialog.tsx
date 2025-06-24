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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChecklistDialog } from '@/components/ChecklistDialog';
import { useCollection } from '@/hooks/useFirestore';
import { Stand, Responsible } from '@/types';

interface StandActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string;
  onActionComplete: (message: string) => void;
}

export function StandActionDialog({ isOpen, onClose, scannedCode, onActionComplete }: StandActionDialogProps) {
  const [action, setAction] = useState<'receive' | 'issue' | null>(null);
  const [responsibleId, setResponsibleId] = useState('');
  const [issueTo, setIssueTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const { data: stands, update: updateStand } = useCollection<Stand>('stands');
  const { data: responsibles } = useCollection<Responsible>('responsibles');

  const stand = stands.find(s => `STAND_${s.number}` === scannedCode);

  const handleReceive = () => {
    setAction('receive');
    setShowChecklist(true);
  };

  const handleIssue = () => {
    setAction('issue');
  };

  const handleChecklistComplete = async (message: string) => {
    if (message.includes('успешно')) {
      // Update stand status to "В зале" after successful checklist submission
      if (stand) {
        await updateStand(stand.id, { status: 'В зале' });
      }
      onActionComplete(message);
      resetDialog();
    } else {
      onActionComplete(message);
    }
    setShowChecklist(false);
  };

  const handleIssueSubmit = async () => {
    if (!stand) return;

    setIsSubmitting(true);

    try {
      if (action === 'issue' && issueTo) {
        const success = await updateStand(stand.id, { status: issueTo });
        if (success) {
          onActionComplete(`Стенд успешно выдан: ${issueTo}`);
          resetDialog();
        } else {
          onActionComplete('Ошибка при выдаче стенда');
        }
      }
    } catch (error) {
      onActionComplete('Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDialog = () => {
    setAction(null);
    setResponsibleId('');
    setIssueTo('');
    setIsSubmitting(false);
    setShowChecklist(false);
  };

  const handleClose = () => {
    resetDialog();
    onClose();
  };

  if (!stand) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Стенд не найден</DialogTitle>
          </DialogHeader>
          <p>QR код {scannedCode} не соответствует ни одному стенду в системе.</p>
          <Button onClick={handleClose}>Закрыть</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen && !showChecklist} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Стенд #{stand.number}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Тема: {stand.theme}</p>
              <p className="text-sm text-muted-foreground">Статус: {stand.status}</p>
            </div>

            {!action && (
              <div className="space-y-2">
                <Button onClick={handleReceive} className="w-full">
                  Принять
                </Button>
                <Button onClick={handleIssue} variant="outline" className="w-full">
                  Выдать
                </Button>
              </div>
            )}

            {action === 'issue' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="responsible">Кто выдаёт</Label>
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
                  <Label htmlFor="issueTo">Кому выдаём</Label>
                  <Input
                    id="issueTo"
                    value={issueTo}
                    onChange={(e) => setIssueTo(e.target.value)}
                    placeholder="Введите имя получателя"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleIssueSubmit} 
                    disabled={isSubmitting || !responsibleId || !issueTo}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Обработка...' : 'Выдать'}
                  </Button>
                  <Button onClick={() => setAction(null)} variant="outline">
                    Отмена
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showChecklist && (
        <ChecklistDialog
          isOpen={showChecklist}
          onClose={() => setShowChecklist(false)}
          stand={stand}
          onComplete={handleChecklistComplete}
        />
      )}
    </>
  );
}
