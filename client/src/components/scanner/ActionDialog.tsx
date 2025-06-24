import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stand } from '@/types';

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  stand: Stand | null;
  onReceive: () => void;
  onGiveOut: () => void;
}

export function ActionDialog({ 
  open, 
  onClose, 
  stand, 
  onReceive, 
  onGiveOut 
}: ActionDialogProps) {
  if (!stand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Стенд #{stand.number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Тема:</p>
            <p className="font-medium">{stand.theme}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Статус:</p>
            <p className="font-medium">{stand.status}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={onReceive} className="flex-1">
              Принять
            </Button>
            <Button onClick={onGiveOut} variant="outline" className="flex-1">
              Выдать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
