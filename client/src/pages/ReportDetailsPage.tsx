import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/hooks/useFirestore';
import { Report } from '@/types';

export function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: reports } = useCollection<Report>('reports');

  const report = reports.find(r => r.id === id);

  if (!report) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Отчёт не найден</p>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('ru-RU');
    }
    return new Date(date).toLocaleDateString('ru-RU');
  };

  const hasIssues = report.answers.some(answer => !answer.answer || answer.notes?.trim());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Отчёт по стенду #{report.standNumber}</h2>
          <p className="text-muted-foreground">{formatDate(report.date)}</p>
        </div>
        <div className="flex flex-col gap-2">
          {report.isServiced ? (
            <Badge variant="default">
              Обслужено {report.servicedDate && formatDate(report.servicedDate)}
            </Badge>
          ) : hasIssues ? (
            <Badge variant="destructive">Требует обслуживания</Badge>
          ) : (
            <Badge variant="secondary">Проверен</Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Информация об отчёте</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="text-sm text-muted-foreground">Ответственный:</span>
            <p className="font-medium">{report.responsibleName}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Дата проверки:</span>
            <p className="font-medium">{formatDate(report.date)}</p>
          </div>
          {report.isServiced && (
            <>
              <div>
                <span className="text-sm text-muted-foreground">Обслужил:</span>
                <p className="font-medium">{report.servicedBy}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Дата обслуживания:</span>
                <p className="font-medium">{report.servicedDate && formatDate(report.servicedDate)}</p>
              </div>
              {report.serviceNotes && (
                <div>
                  <span className="text-sm text-muted-foreground">Примечания по обслуживанию:</span>
                  <p className="font-medium">{report.serviceNotes}</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Результаты проверки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {report.answers.map((answer, index) => (
            <div key={answer.checklistItemId} className="border rounded-md p-4">
              <div className="flex items-start gap-3 mb-2">
                <span className="text-sm text-muted-foreground">#{index + 1}</span>
                <div className="flex-1">
                  <p className="font-medium mb-2">{answer.question}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant={answer.answer ? 'default' : 'destructive'}>
                      {answer.answer ? 'Да' : 'Нет'}
                    </Badge>
                  </div>
                </div>
              </div>
              {answer.notes && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <span className="text-sm text-muted-foreground">Замечания:</span>
                  <p className="text-sm mt-1">{answer.notes}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
