import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { getReports, deleteDoc, doc } from '@/lib/firebase';
import { db } from '@/lib/firebase';

interface Report {
  id: string;
  standCode: string;
  createdAt: any;
  responsible?: string;
  hasIssues?: boolean;
  isServiced?: boolean;
  type: 'acceptance' | 'issue';
  issuer?: string;
  recipient?: string;
}

export function ReportsList() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadReports = async () => {
    try {
      const data = await getReports();
      setReports(data as Report[]);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReports();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот отчёт?')) {
      try {
        await deleteDoc(doc(db, 'reports', id));
        await loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
        alert('Ошибка при удалении отчёта');
      }
    }
  };

  const getStatusBadge = (report: Report) => {
    if (report.type === 'issue') {
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Выдача</Badge>;
    }
    
    if (!report.hasIssues) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/20">Всё в порядке</Badge>;
    }
    if (report.hasIssues && !report.isServiced) {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/20">Требует обслуживания</Badge>;
    }
    return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/20">Обслужено</Badge>;
  };

  const getStatusIcon = (report: Report) => {
    if (report.type === 'issue') {
      return <CheckCircle className="h-5 w-5 text-blue-400" />;
    }
    
    if (!report.hasIssues) {
      return <CheckCircle className="h-5 w-5 text-green-400" />;
    }
    if (report.hasIssues && !report.isServiced) {
      return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
    return <CheckCircle className="h-5 w-5 text-blue-400" />;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Загрузка отчётов...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Отчёты не найдены</p>
        <p className="text-sm text-muted-foreground mt-2">
          Отчёты будут появляться после сканирования стендов
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-card-foreground">
                <FileText className="h-5 w-5" />
                {report.standCode}
              </CardTitle>
              <div className="flex items-center gap-2">
                {getStatusIcon(report)}
                <Button size="sm" variant="ghost" onClick={() => handleDelete(report.id)}>
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {formatDate(report.createdAt)}
              </span>
              {getStatusBadge(report)}
            </div>
            
            {report.type === 'acceptance' && report.responsible && (
              <p className="text-sm text-muted-foreground">Ответственный: {report.responsible}</p>
            )}
            
            {report.type === 'issue' && (
              <div className="text-sm text-muted-foreground">
                <p>Выдал: {report.issuer}</p>
                <p>Получил: {report.recipient}</p>
              </div>
            )}
            
            {report.hasIssues && !report.isServiced && report.type === 'acceptance' && (
              <Button size="sm" variant="outline" className="mt-2">
                Обслужить
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
