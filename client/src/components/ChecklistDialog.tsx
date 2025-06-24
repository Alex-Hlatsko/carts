import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectPerson } from './ui/select-person';
import { useChecklist } from '../hooks/useChecklist';
import { useReports } from '../hooks/useReports';
import toast from 'react-hot-toast';

interface ChecklistDialogProps {
  standId: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ChecklistDialog({ standId, isOpen, onClose, onComplete }: ChecklistDialogProps) {
  const { checklistItems } = useChecklist();
  const { addReport } = useReports();
  const [checkedItems, setCheckedItems] = React.useState<{ [key: string]: boolean }>({});
  const [signature, setSignature] = React.useState('');

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleSubmit = async () => {
    if (!signature.trim()) {
      toast.error('Пожалуйста, выберите подпись');
      return;
    }

    try {
      await addReport({
        standId,
        checkedItems,
        signature,
        type: 'accept'
      });
      toast.success('Отчёт успешно отправлен');
      onComplete();
    } catch (error) {
      toast.error('Ошибка при отправке отчёта');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden mx-4">
        <DialogHeader>
          <DialogTitle>Чек-лист приёмки стенда</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {checklistItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox
                id={item.id}
                checked={checkedItems[item.id] || false}
                onCheckedChange={(checked) => handleItemCheck(item.id, !!checked)}
              />
              <Label htmlFor={item.id} className="text-sm flex-1">
                {item.text}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="signature">Подпись (ФИО)</Label>
            <SelectPerson
              onValueChange={setSignature}
              placeholder="Выберите ответственного"
              value={signature}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button onClick={handleSubmit} className="flex-1">
              Отправить отчёт
            </Button>
            <Button onClick={onClose} variant="outline" className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
