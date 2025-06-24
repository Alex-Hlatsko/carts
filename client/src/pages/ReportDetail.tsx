import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCollection } from '@/hooks/useFirestore';
import { Report } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: reports } = useCollection<Report>('reports');

  const report = reports.find(r => r.id === id);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!report) {
    return (
      <div className="p-4">
        <div className="text-center">Отчёт не найден</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate('/reports')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-2xl font-bold">Отчёт по стенду №{report.standNumber}</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация об отчёте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600">Стенд:</span>
              <p className="text-lg">№{report.standNumber}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Ответственный:</span>
              <p className="text-lg">{report.responsiblePersonName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Дата проверки:</span>
              <p className="text-lg">{formatDate(report.date)}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Статус:</span>
              <div className="mt-1">
                {report.isServiced ? (
                  <Badge variant="secondary">
                    Обслужено {report.servicedDate && formatDate(report.servicedDate)}
                  </Badge>
                ) : (
                  <Badge variant="default">Активный</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результаты проверки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.answers.map((answer, index) => (
              <div key={answer.checklistItemId} className="border rounded p-4">
                <div className="flex items-start gap-3 mb-2">
                  {answer.answer ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{answer.question}</p>
                    <p className={`text-sm ${answer.answer ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.answer ? 'Да' : 'Нет'}
                    </p>
                  </div>
                </div>
                
                {answer.notes && (
                  <div className="mt-3 pl-8">
                    <span className="text-xs text-gray-600 font-medium">Замечания:</span>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">
                      {answer.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {report.isServiced && (
          <Card>
            <CardHeader>
              <CardTitle>Информация об обслуживании</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Обслужено:</span>
                <p className="text-lg">{report.servicedBy}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Дата обслуживания:</span>
                <p className="text-lg">{report.servicedDate && formatDate(report.servicedDate)}</p>
              </div>
              {report.servicedNotes && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Примечания:</span>
                  <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded mt-1">
                    {report.servicedNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
