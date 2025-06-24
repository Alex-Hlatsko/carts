import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toast } from '@/components/Toast';
import { useCollection } from '@/hooks/useFirestore';
import { Report, Responsible } from '@/types';
import { CheckCircle, XCircle, Wrench } from 'lucide-react';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isServiceMode = searchParams.get('service') === 'true';
  
  const { data: reports, updateItem } = useCollection<Report>('reports');
  const { data: responsibles } = useCollection<Responsible>('responsibles', 'name');
  const [report, setReport] = useState<Report | null>(null);
  const [selectedResponsible, setSelectedResponsible] = useState<string>('');
  const [serviceNotes, setServiceNotes] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const foundReport = reports.find(r => r.id === id);
    setReport(foundReport || null);
  }, [reports, id]);

  const handleService = async () => {
    if (!report || !selectedResponsible || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const responsible = responsibles.find(r => r.id === selectedResponsible);
      if (!responsible) throw new Error('Ответственный не найден');

      const success = await updateItem(report.id, {
        isServiced: true,
        servicedBy: responsible.name,
        servicedAt: new Date(),
        serviceNotes: serviceNotes.trim() || undefined
      });

      if (success) {
        setShowToast({ message: 'Отчёт обслужен', type: 'success' });
        setTimeout(() => navigate('/reports'), 1500);
      } else {
        throw new Error('Ошибка обновления отчёта');
      }
    } catch (error) {
      setShowToast({ message: 'Ошибка при обслуживании', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) {
    return (
      <Layout 
        title="Отчёт" 
        showBackButton 
        onBack={() => navigate('/reports')}
      >
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Отчёт не найден</p>
        </div>
      </Layout>
    );
  }

  const needsService = !report.isServiced && report.answers && Array.isArray(report.answers) && (
    report.answers.some(answer => answer && !answer.answer) ||
    report.answers.some(answer => answer && answer.notes && answer.notes.trim().length > 0)
  );

  return (
    <Layout 
      title={`Отчёт - Стенд #${report.standNumber || 'N/A'}`} 
      showBackButton 
      onBack={() => navigate('/reports')}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация об отчёте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Стенд:</span> #{report.standNumber || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Дата:</span> {report.date ? new Date(report.date).toLocaleDateString() : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Ответственный:</span> {report.responsibleName || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Статус:</span>{' '}
              <span className={report.isServiced ? 'text-green-600' : 'text-blue-600'}>
                {report.isServiced ? 'Обслужено' : 'Принято'}
              </span>
              {report.isServiced && report.servicedAt && (
                <div className="text-xs text-gray-500 mt-1">
                  Обслужено: {new Date(report.servicedAt).toLocaleDateString()} - {report.servicedBy || 'N/A'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Результаты проверки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.answers && Array.isArray(report.answers) ? (
              report.answers.map((answer, index) => {
                if (!answer) return null;
                
                return (
                  <div key={answer.questionId || index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                    <div className="flex items-start space-x-3 mb-2">
                      {answer.answer ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{answer.question || 'Вопрос не указан'}</p>
                        <p className={`text-xs ${answer.answer ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.answer ? 'Да' : 'Нет'}
                        </p>
                      </div>
                    </div>
                    {answer.notes && answer.notes.trim() && (
                      <div className="ml-8 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                        <span className="font-medium">Замечания:</span> {answer.notes}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Нет данных проверки</p>
            )}
          </CardContent>
        </Card>

        {report.serviceNotes && (
          <Card>
            <CardHeader>
              <CardTitle>Примечания к обслуживанию</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{report.serviceNotes}</p>
            </CardContent>
          </Card>
        )}

        {isServiceMode && !report.isServiced && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Обслуживание
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="responsible">Обслуживает</Label>
                <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ответственного" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsibles.map((responsible) => (
                      <SelectItem key={responsible.id} value={responsible.id}>
                        {responsible.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceNotes">Обслужил и исправил</Label>
                <Input
                  id="serviceNotes"
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="Опишите выполненные работы..."
                />
              </div>

              <Button 
                onClick={handleService} 
                className="w-full"
                disabled={!selectedResponsible || isSubmitting}
              >
                {isSubmitting ? 'Подтверждение...' : 'Подтвердить обслуживание'}
              </Button>
            </CardContent>
          </Card>
        )}

        {needsService && !isServiceMode && (
          <Button
            onClick={() => navigate(`/reports/${report.id}?service=true`)}
            className="w-full"
            variant="outline"
          >
            <Wrench className="h-4 w-4 mr-2" />
            Обслужить этот отчёт
          </Button>
        )}
      </div>

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
