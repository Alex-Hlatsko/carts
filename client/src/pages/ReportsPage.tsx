import * as React from 'react';
import { Input } from '@/components/ui/input';
import { ReportCard } from '@/components/reports/ReportCard';
import { ReportDetailDialog } from '@/components/reports/ReportDetailDialog';
import { ServiceDialog } from '@/components/reports/ServiceDialog';
import { useCollection } from '@/hooks/useFirestore';
import { useToast } from '@/hooks/useToast';
import { Report, ResponsiblePerson } from '@/types';
import { Search } from 'lucide-react';

export function ReportsPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [serviceReport, setServiceReport] = React.useState<Report | null>(null);
  const [showDetail, setShowDetail] = React.useState(false);
  const [showService, setShowService] = React.useState(false);

  const { data: reports, deleteItem, updateItem, loading } = useCollection<Report>('reports');
  const { data: responsiblePersons } = useCollection<ResponsiblePerson>('responsiblePersons');
  const { showSuccess, showError } = useToast();

  const filteredReports = React.useMemo(() => {
    return reports.filter(report => 
      report.standNumber.toString().includes(searchTerm) ||
      report.responsiblePerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [reports, searchTerm]);

  const handleDelete = React.useCallback(async (report: Report) => {
    if (!confirm(`Удалить отчёт для стенда #${report.standNumber}?`)) return;

    const result = await deleteItem(report.id);

    if (result.success) {
      showSuccess('Отчёт удалён');
    } else {
      showError('Ошибка при удалении отчёта');
    }
  }, [deleteItem, showSuccess, showError]);

  const handleService = React.useCallback((report: Report) => {
    setServiceReport(report);
    setShowService(true);
  }, []);

  const handleReportClick = React.useCallback((report: Report) => {
    setSelectedReport(report);
    setShowDetail(true);
  }, []);

  const handleServiceSubmit = React.useCallback(async (data: {
    servicedBy: string;
    serviceNotes: string;
  }) => {
    if (!serviceReport) return;

    const result = await updateItem(serviceReport.id, {
      isServiced: true,
      servicedBy: data.servicedBy,
      servicedDate: new Date(),
      serviceNotes: data.serviceNotes || undefined
    });

    if (result.success) {
      showSuccess('Отчёт помечен как обслуженный');
    } else {
      showError('Ошибка при обновлении отчёта');
    }

    setShowService(false);
    setServiceReport(null);
  }, [serviceReport, updateItem, showSuccess, showError]);

  if (loading) {
    return <div className="container mx-auto p-4">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Отчёты</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск по номеру стенда или ответственному..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(report => (
          <ReportCard
            key={report.id}
            report={report}
            onDelete={handleDelete}
            onService={handleService}
            onClick={handleReportClick}
          />
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm ? 'Отчёты не найдены' : 'Отчёты не найдены'}
          </p>
        </div>
      )}

      <ReportDetailDialog
        open={showDetail}
        onClose={() => setShowDetail(false)}
        report={selectedReport}
      />

      <ServiceDialog
        open={showService}
        onClose={() => setShowService(false)}
        report={serviceReport}
        responsiblePersons={responsiblePersons}
        onSubmit={handleServiceSubmit}
      />
    </div>
  );
}
