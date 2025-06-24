import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChecklistDialog } from './ChecklistDialog';
import { SelectPerson } from './ui/select-person';
import { useStand } from '../hooks/useStand';
import { HandIcon, CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface StandActionDialogProps {
  standId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function StandActionDialog({ standId, isOpen, onClose }: StandActionDialogProps) {
  const { stand, updateStandStatus } = useStand(standId);
  const [action, setAction] = React.useState<'accept' | 'handout' | null>(null);
  const [handoutBy, setHandoutBy] = React.useState('');
  const [handoutTo, setHandoutTo] = React.useState('');
  const [showChecklist, setShowChecklist] = React.useState(false);

  const handleAccept = () => {
    setAction('accept');
    setShowChecklist(true);
  };

  const handleHandout = async () => {
    if (!handoutBy.trim() || !handoutTo.trim()) {
      toast.error('Заполните все поля');
      return;
    }
    
    try {
      await updateStandStatus(standId, handoutTo);
      toast.success('Стенд успешно выдан');
      onClose();
    } catch (error) {
      toast.error('Ошибка при выдаче стенда');
    }
  };

  const handleChecklistComplete = async () => {
    try {
      await updateStandStatus(standId, 'В Зале');
      setShowChecklist(false);
      toast.success('Стенд успешно принят');
      onClose();
    } catch (error) {
      toast.error('Ошибка при приёме стенда');
    }
  };

  if (!stand) {
    return null;
  }

  return (
    <>
      <Dialog open={isOpen && !showChecklist} onOpenChange={onClose}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle>Стенд №{stand.number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Тема: {stand.theme}
            </p>
            <p className="text-sm text-muted-foreground">
              Текущий статус: {stand.status}
            </p>

            {action === null && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button onClick={handleAccept} className="flex-1">
                  <CheckIcon className="h-4 w-4 mr-2" />
                  Принять
                </Button>
                <Button onClick={() => setAction('handout')} variant="outline" className="flex-1">
                  <HandIcon className="h-4 w-4 mr-2" />
                  Выдать
                </Button>
              </div>
            )}

            {action === 'handout' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="handoutBy">Кто выдаёт</Label>
                  <SelectPerson
                    onValueChange={setHandoutBy}
                    placeholder="Выберите кто выдаёт"
                    value={handoutBy}
                  />
                </div>
                <div>
                  <Label htmlFor="handoutTo">Кому выдаёт</Label>
                  <SelectPerson
                    onValueChange={setHandoutTo}
                    placeholder="Выберите кому выдаёт"
                    value={handoutTo}
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button onClick={handleHandout} className="flex-1">
                    Выдать стенд
                  </Button>
                  <Button onClick={() => setAction(null)} variant="outline" className="flex-1">
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
          standId={standId}
          isOpen={showChecklist}
          onClose={() => setShowChecklist(false)}
          onComplete={handleChecklistComplete}
        />
      )}
    </>
  );
}
