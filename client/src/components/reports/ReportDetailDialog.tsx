import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Report, ChecklistItem } from '@/types';
import { useCollection } from '@/hooks/useFirestore';
import { ArrowLeft, Check, X } from 'lucide-react';

interface ReportDetailDialogProps {
  open: boolean;
  onClose: () => void;
  report: Report | null;
}

export function ReportDetailDialog({ open, onClose, report }: ReportDetailDialogProps) {
  const { data: checklistItems } = useCollection<ChecklistItem>('checklistItems');

  const getQuestionText = React.useCallback((itemId: string) => {
    const item = checklistItems.find(item => item.id === itemId);
    return item?.question || 'Вопрос не найден';
  }, [checklistItems]);

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Отчёт для стенда #{report.standNumber}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Информация об отчёте</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Ответственный:</span>
                <span className="ml-2 font-medium">{report.responsiblePerson}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Дата:</span>
                <span className="ml-2">{new Date(report.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Статус:</span>
                {report.isServiced ? (
                  <Badge variant="default" className="ml-2">
                    Обслужено {report.servicedDate ? new Date(report.servicedDate).toLocaleDateString('ru-RU') : ''}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">Активен</Badge>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Ответы на чек-лист</h3>
            <div className="space-y-3">
              {report.answers && Array.isArray(report.answers) ? (
                report.answers.map((answer, index) => (
                  <Card key={index} className={!answer.answer ? 'border-red-200' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 ${answer.answer ? 'text-green-500' : 'text-red-500'}`}>
                          {answer.answer ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {getQuestionText(answer.checklistItemId)}
                          </p>
                          {answer.notes && (
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>Заметки:</strong> {answer.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Ответы на чек-лист не найдены</p>
              )}
            </div>
          </div>

          {report.isServiced && (
            <div>
              <h3 className="font-medium mb-3">Информация об обслуживании</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    {report.servicedBy && (
                      <div>
                        <span className="text-muted-foreground">Обслужил:</span>
                        <span className="ml-2 font-medium">{report.servicedBy}</span>
                      </div>
                    )}
                    {report.servicedDate && (
                      <div>
                        <span className="text-muted-foreground">Дата обслуживания:</span>
                        <span className="ml-2">{new Date(report.servicedDate).toLocaleDateString('ru-RU')}</span>
                      </div>
                    )}
                    {report.serviceNotes && (
                      <div>
                        <span className="text-muted-foreground">Примечания:</span>
                        <p className="mt-1">{report.serviceNotes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
