import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/toast';
import { Report } from '@/types';
import { Eye, Trash2, Settings } from 'lucide-react';

export function ReportsPage() {
  const navigate = useNavigate();
  const { data: reports, remove: removeReport } = useCollection<Report>('reports');
  const { toasts, removeToast, success, error } = useToast();

  const handleViewReport = (reportId: string) => {
    navigate(`/reports/${reportId}`);
  };

  const handleServiceReport = (reportId: string) => {
    navigate(`/reports/${reportId}/service`);
  };

  const handleRemoveReport = async (report: Report) => {
    if (confirm(`Вы уверены, что хотите удалить отчёт от ${report.date.toLocaleDateString()}?`)) {
      const result = await removeReport(report.id);
      if (result) {
        success('Отчёт успешно удалён');
      } else {
        error('Ошибка при удалении отчёта');
      }
    }
  };

  const needsService = (report: Report) => {
    return report.answers.some(answer => !answer.answer || answer.notes?.trim());
  };

  const formatDate = (date: Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString('ru-RU');
    }
    // Handle Firestore timestamp
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Отчёты</h2>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Стенд #{report.standNumber}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {report.responsibleName} • {formatDate(report.date)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {report.isServiced ? (
                    <Badge variant="default">
                      Обслужено {report.servicedDate && formatDate(report.servicedDate)}
                    </Badge>
                  ) : needsService(report) ? (
                    <Badge variant="destructive">Требует обслуживания</Badge>
                  ) : (
                    <Badge variant="secondary">Проверен</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleViewReport(report.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Просмотр
                </Button>
                
                {needsService(report) && !report.isServiced && (
                  <Button
                    onClick={() => handleServiceReport(report.id)}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Обслужить
                  </Button>
                )}
                
                <Button
                  onClick={() => handleRemoveReport(report)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Нет отчётов. Отчёты появятся после принятия стендов.
          </p>
        </div>
      )}

      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
