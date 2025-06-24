import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Report } from '@/types';
import { Trash2, Wrench } from 'lucide-react';

interface ReportCardProps {
  report: Report;
  onDelete: (report: Report) => void;
  onService: (report: Report) => void;
  onClick: (report: Report) => void;
}

export function ReportCard({ report, onDelete, onService, onClick }: ReportCardProps) {
  const handleCardClick = React.useCallback(() => {
    onClick(report);
  }, [onClick, report]);

  const handleDelete = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(report);
  }, [onDelete, report]);

  const handleService = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onService(report);
  }, [onService, report]);

  const hasIssues = React.useMemo(() => {
    if (!report.answers || !Array.isArray(report.answers)) {
      return false;
    }
    return report.answers.some(answer => !answer.answer || answer.notes);
  }, [report.answers]);

  const needsService = hasIssues && !report.isServiced;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Стенд #{report.standNumber}</CardTitle>
            <div className="flex gap-2 mt-1">
              {report.isServiced ? (
                <Badge variant="default">
                  Обслужено {report.servicedDate ? new Date(report.servicedDate).toLocaleDateString('ru-RU') : ''}
                </Badge>
              ) : hasIssues ? (
                <Badge variant="destructive">Требует обслуживания</Badge>
              ) : (
                <Badge variant="secondary">Без замечаний</Badge>
              )}
            </div>
          </div>
          <div className="flex gap-1">
            {needsService && (
              <Button size="sm" variant="ghost" onClick={handleService}>
                <Wrench className="h-4 w-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Ответственный:</span>
            <span className="ml-2 font-medium">{report.responsiblePerson}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Дата:</span>
            <span className="ml-2">{new Date(report.date).toLocaleDateString('ru-RU')}</span>
          </div>
          {report.isServiced && report.servicedBy && (
            <div>
              <span className="text-muted-foreground">Обслужил:</span>
              <span className="ml-2">{report.servicedBy}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
