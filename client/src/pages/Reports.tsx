import React, { useState } from 'react';
import { useCollection } from '@/hooks/useFirestore';
import { Report } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/components/ui/toast';

export function Reports() {
  const { data: reports, loading, deleteItem } = useCollection<Report>('reports');
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const { showToast, ToastComponent } = useToast();

  const handleDelete = async (id: string) => {
    const result = await deleteItem(id);
    if (result.success) {
      showToast('Отчёт успешно удален', 'success');
    } else {
      showToast('Ошибка при удалении отчёта', 'error');
    }
    setDeleteReportId(null);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasIssues = (report: Report) => {
    return report.answers.some(answer => !answer.answer || answer.notes);
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {ToastComponent}
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Отчёты</h1>
        <p className="text-gray-600">Все отчёты по приёму стендов</p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Стенд №{report.standNumber}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {report.responsiblePersonName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(report.date)}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  {report.isServiced ? (
                    <Badge variant="secondary">
                      Обслужено {report.servicedDate && formatDate(report.servicedDate)}
                    </Badge>
                  ) : hasIssues(report) ? (
                    <Badge variant="destructive">Требует обслуживания</Badge>
                  ) : (
                    <Badge variant="default">В порядке</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Link to={`/report/${report.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-1" />
                    Просмотр
                  </Button>
                </Link>
                
                {hasIssues(report) && !report.isServiced && (
                  <Link to={`/service-report/${report.id}`}>
                    <Button variant="default" size="sm">
                      <Wrench className="w-4 h-4 mr-1" />
                      Обслужить
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteReportId(report.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Отчёты отсутствуют</p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteReportId !== null}
        onOpenChange={(open) => !open && setDeleteReportId(null)}
        title="Удаление отчёта"
        description="Вы уверены, что хотите удалить этот отчёт? Это действие нельзя отменить."
        onConfirm={() => deleteReportId && handleDelete(deleteReportId)}
        confirmText="Удалить"
        variant="destructive"
      />
    </div>
  );
}
