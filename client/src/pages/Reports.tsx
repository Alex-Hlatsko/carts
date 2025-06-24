import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCollection } from '@/hooks/useFirestore';
import { Report, ChecklistItem } from '@/types';
import { useToast, Toast } from '@/components/ui/toast';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Trash2, Eye, FileText, Check, X } from 'lucide-react';

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; reportId: string }>({
    open: false,
    reportId: ''
  });

  const { data: reports, remove: removeReport } = useCollection<Report>('reports');
  const { data: checklistItems } = useCollection<ChecklistItem>('checklist');
  const { toast, showToast, hideToast } = useToast();

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setShowDetailsDialog(true);
  };

  const handleDeleteReport = async () => {
    const result = await removeReport(deleteDialog.reportId);
    if (result.success) {
      showToast('Отчёт успешно удалён', 'success');
    } else {
      showToast('Ошибка при удалении отчёта', 'error');
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'accept' ? 'Приём' : 'Выдача';
  };

  const getTypeColor = (type: string) => {
    return type === 'accept' ? 'default' : 'secondary';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Отчёты</h1>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Нет отчётов</h3>
          <p className="text-muted-foreground mb-4">
            Отчёты будут появляться после сканирования стендов
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Стенд {report.standNumber}</CardTitle>
                  <Badge variant={getTypeColor(report.type)}>
                    {getTypeLabel(report.type)}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{new Date(report.createdAt).toLocaleString()}</p>
                  <p>Подпись: {report.signature}</p>
                  {report.issuedTo && <p>Выдан: {report.issuedTo}</p>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(report)}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Подробнее
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog({ open: true, reportId: report.id })}
                  className="w-full justify-start"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Отчёт по стенду {selectedReport?.standNumber}
            </DialogTitle>
            <DialogDescription>
              {selectedReport && getTypeLabel(selectedReport.type)} - {selectedReport && new Date(selectedReport.createdAt).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Основная информация</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Тип операции:</strong> {getTypeLabel(selectedReport.type)}</p>
                  <p><strong>Дата и время:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  <p><strong>Подпись:</strong> {selectedReport.signature}</p>
                  {selectedReport.issuedBy && (
                    <p><strong>Кто выдал:</strong> {selectedReport.issuedBy}</p>
                  )}
                  {selectedReport.issuedTo && (
                    <p><strong>Кому выдан:</strong> {selectedReport.issuedTo}</p>
                  )}
                </div>
              </div>

              {selectedReport.type === 'accept' && Object.keys(selectedReport.checklist).length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Чек-лист</h3>
                  <div className="space-y-2">
                    {checklistItems
                      .sort((a, b) => a.order - b.order)
                      .map((item) => {
                        const isChecked = selectedReport.checklist[item.id];
                        return (
                          <div key={item.id} className="flex items-center space-x-2">
                            {isChecked ? (
                              <Check className="w-5 h-5 text-green-500" />
                            ) : (
                              <X className="w-5 h-5 text-red-500" />
                            )}
                            <span className="text-sm">{item.text}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, reportId: '' })}
        title="Удалить отчёт"
        description="Вы уверены, что хотите удалить этот отчёт? Это действие нельзя отменить."
        onConfirm={handleDeleteReport}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}
    </div>
  );
}
