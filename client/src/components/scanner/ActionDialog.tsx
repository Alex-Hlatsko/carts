import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackButton } from '@/components/ui/back-button';

interface ActionDialogProps {
  standCode: string;
  onAction: (action: 'accept' | 'issue') => void;
  onBack: () => void;
}

export function ActionDialog({ standCode, onAction, onBack }: ActionDialogProps) {
  return (
    <div className="space-y-4">
      <BackButton onClick={onBack} />
      
      <Card>
        <CardHeader>
          <CardTitle>Стенд: {standCode}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">Выберите действие:</p>
          
          <div className="grid grid-cols-1 gap-4">
            <Button
              onClick={() => onAction('accept')}
              className="h-12"
              variant="default"
            >
              Принять
            </Button>
            
            <Button
              onClick={() => onAction('issue')}
              className="h-12"
              variant="outline"
            >
              Выдать
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
