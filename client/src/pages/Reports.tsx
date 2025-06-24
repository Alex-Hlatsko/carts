import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trash2, Eye, ArrowLeft } from 'lucide-react';
import { useReports } from '../hooks/useReports';
import { Report } from '../types';
import { ReportDetailsDialog } from '../components/ReportDetailsDialog';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function Reports() {
  const navigate = useNavigate();
  const { reports, loading, deleteReport } = useReports();
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id);
      setDeleteConfirm(null);
      toast.success('Отчёт удален');
    } catch (error) {
      toast.error('Ошибка при удалении отчёта');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Отчёты</h1>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Отчёты не найдены</p>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base md:text-lg">
                      Стенд №{report.standNumber} - {report.type === 'accept' ? 'Приёмка' : 'Выдача'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.createdAt)} • Подпись: {report.signature}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirm(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {report.type === 'handout' && report.handoutTo && (
                    <p>Выдано: {report.handoutTo} от {report.handoutBy}</p>
                  )}
                  {report.type === 'accept' && (
                    <p>Проверено пунктов: {Object.values(report.checkedItems).filter(Boolean).length}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedReport && (
        <ReportDetailsDialog
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="mx-4">
          <DialogHeader>
            <DialogTitle>Подтвердите удаление</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Вы уверены, что хотите удалить этот отчёт?</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button
                variant="destructive"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                className="flex-1"
              >
                Удалить
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
