import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportGenerator } from '@/components/ReportGenerator';
import { useCollection } from '@/hooks/useFirestore';
import { Report } from '@/types';
import { ArrowLeft, Search, Download, Upload, Calendar } from 'lucide-react';

export function ReportsPage() {
  const navigate = useNavigate();
  const { data: reports, loading } = useCollection<Report>('reports');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.standName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.handledBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.handledTo && report.handledTo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAction = actionFilter === 'all' || report.action === actionFilter;

    let matchesDate = true;
    if (dateFilter !== 'all') {
      const now = new Date();
      const reportDate = report.timestamp;
      
      switch (dateFilter) {
        case 'today':
          matchesDate = reportDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reportDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          matchesDate = reportDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesAction && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка отчётов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Отчёты</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Поиск по названию, сотруднику..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Тип действия" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все действия</SelectItem>
              <SelectItem value="receive">Принятые</SelectItem>
              <SelectItem value="issue">Выданные</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Период" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все время</SelectItem>
              <SelectItem value="today">Сегодня</SelectItem>
              <SelectItem value="week">Неделя</SelectItem>
              <SelectItem value="month">Месяц</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredReports.length > 0 && (
          <div className="mb-6">
            <ReportGenerator reports={filteredReports} />
          </div>
        )}

        <div className="space-y-4">
          {filteredReports.map(report => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${
                    report.action === 'receive' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {report.action === 'receive' ? (
                      <Download className="h-5 w-5" />
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{report.standName}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        report.action === 'receive' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.action === 'receive' ? 'Принят' : 'Выдан'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p><strong>Сотрудник:</strong> {report.handledBy}</p>
                        {report.handledTo && (
                          <p><strong>Получатель:</strong> {report.handledTo}</p>
                        )}
                      </div>
                      <div>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {report.timestamp.toLocaleDateString('ru-RU')} в {report.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    {report.comments && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm"><strong>Комментарии:</strong> {report.comments}</p>
                      </div>
                    )}

                    {report.checklist && Object.keys(report.checklist).length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Чек-лист:</p>
                        <div className="space-y-1">
                          {Object.entries(report.checklist).map(([key, value]) => (
                            <div key={key} className="text-sm text-gray-600 flex gap-2">
                              <span className="font-medium">{key}:</span>
                              <span>{typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {searchTerm || actionFilter !== 'all' || dateFilter !== 'all' 
                ? 'Отчёты не найдены с текущими фильтрами' 
                : 'Пока нет созданных отчётов'}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}