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
import { Stand, Report } from '@/types';
import { useCollection } from '@/hooks/useFirestore';
import { ArrowLeft } from 'lucide-react';

interface StandDetailDialogProps {
  open: boolean;
  onClose: () => void;
  stand: Stand | null;
}

export function StandDetailDialog({ open, onClose, stand }: StandDetailDialogProps) {
  const { data: reports } = useCollection<Report>('reports');

  const standReports = React.useMemo(() => {
    if (!stand) return [];
    return reports.filter(report => report.standId === stand.id).slice(0, 3);
  }, [reports, stand]);

  if (!stand) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle>Стенд #{stand.number}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">Информация</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Тема:</span>
                <p className="font-medium">{stand.theme}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Статус:</span>
                <Badge variant={stand.status === 'В зале' ? 'default' : 'secondary'} className="ml-2">
                  {stand.status}
                </Badge>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Материалы на полках</h3>
            <div className="grid gap-4">
              {[1, 2, 3].map(shelfNum => {
                const materials = stand[`shelf${shelfNum}` as keyof Stand] as any[];
                return (
                  <Card key={shelfNum}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Полка {shelfNum}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {materials.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {materials.map((material, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <img 
                                src={material.imageUrl} 
                                alt={material.name}
                                className="w-8 h-8 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%23ddd"/></svg>';
                                }}
                              />
                              <span>{material.name}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Полка пуста</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {standReports.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Последние отчёты</h3>
              <div className="space-y-2">
                {standReports.map(report => (
                  <Card key={report.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{report.responsiblePerson}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(report.date).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        {report.isServiced && (
                          <Badge variant="default" className="text-xs">
                            Обслужено
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
