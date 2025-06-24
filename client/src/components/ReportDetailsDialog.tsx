import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Report } from '../types';
import { useChecklist } from '../hooks/useChecklist';

interface ReportDetailsDialogProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export function ReportDetailsDialog({ report, isOpen, onClose }: ReportDetailsDialogProps) {
  const { checklistItems } = useChecklist();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Отчёт по стенду №{report.standNumber} - {report.type === 'accept' ? 'Приёмка' : 'Выдача'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Основная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Дата:</strong> {formatDate(report.createdAt)}</p>
                  <p><strong>Тип:</strong> {report.type === 'accept' ? 'Приёмка' : 'Выдача'}</p>
                  <p><strong>Подпись:</strong> {report.signature}</p>
                </div>
                {report.type === 'handout' && (
                  <div>
                    <p><strong>Кто выдал:</strong> {report.handoutBy}</p>
                    <p><strong>Кому выдал:</strong> {report.handoutTo}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {report.type === 'accept' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Чек-лист</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={report.checkedItems[item.id] || false}
                        disabled
                      />
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
