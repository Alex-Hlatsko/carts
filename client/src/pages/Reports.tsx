import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Report } from '@/types';
import { Trash2, Eye, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Reports() {
  const { data: reports, deleteItem } = useCollection<Report>('reports', 'createdAt');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    const success = await deleteItem(id);
    if (success) {
      setShowToast({ message: 'Отчёт удален', type: 'success' });
    } else {
      setShowToast({ message: 'Ошибка при удалении', type: 'error' });
    }
  };

  const needsService = (report: Report) => {
    if (!report || report.isServiced || !report.answers || !Array.isArray(report.answers)) {
      return false;
    }
    
    return report.answers.some(answer => 
      answer && (!answer.answer || (answer.notes && answer.notes.trim().length > 0))
    );
  };

  const sortedReports = [...reports].reverse();

  return (
    <Layout title="Отчёты">
      <div className="space-y-4">
        {sortedReports.map((report) => {
          // Safety check for report data
          if (!report || !report.id) return null;

          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Стенд #{report.standNumber || 'N/A'}
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/reports/${report.id}`)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteConfirm(report.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Дата:</span>{' '}
                    {report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Ответственный:</span> {report.responsibleName || 'N/A'}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-medium">Статус:</span>{' '}
                      <span className={report.isServiced ? 'text-green-600' : 'text-blue-600'}>
                        {report.isServiced ? 'Обслужено' : 'Принято'}
                      </span>
                      {report.isServiced && report.servicedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(report.servicedAt).toLocaleDateString()}
                        </span>
                      )}
                    </p>
                    {needsService(report) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/reports/${report.id}?service=true`)}
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Wrench className="h-3 w-3 mr-1" />
                        Обслужить
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {reports.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Нет отчётов</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        title="Удалить отчёт"
        description="Вы уверены, что хотите удалить этот отчёт?"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        variant="destructive"
        confirmText="Удалить"
      />

      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </Layout>
  );
}
