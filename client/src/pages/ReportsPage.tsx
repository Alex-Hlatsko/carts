import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Transaction, Stand } from '@/types';
import { getTransactions, getStands } from '@/lib/firestore';

export function ReportsPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stands, setStands] = useState<Map<string, Stand>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('ReportsPage: Fetching data...');
      setLoading(true);
      const [transactionsData, standsData] = await Promise.all([
        getTransactions(),
        getStands()
      ]);
      
      console.log('ReportsPage: Data fetched', { transactionsData, standsData });
      setTransactions(transactionsData);
      
      // Create stands map for quick lookup
      const standsMap = new Map<string, Stand>();
      standsData.forEach(stand => {
        standsMap.set(stand.id, stand);
      });
      setStands(standsMap);
    } catch (error) {
      console.error('ReportsPage: Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const parseChecklist = (checklistData: any) => {
    if (!checklistData) return null;
    if (typeof checklistData === 'string') {
      try {
        return JSON.parse(checklistData);
      } catch {
        return null;
      }
    }
    return checklistData;
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Отчеты</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка отчетов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Отчеты</h1>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Пока нет операций для отображения
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const stand = stands.get(transaction.standId);
            const checklist = parseChecklist(transaction.checklist);
            
            return (
              <Card key={transaction.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        Стенд #{stand?.number || transaction.standId}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {stand?.theme || 'Неизвестный стенд'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.action === 'issue' ? 'default' : 'secondary'}>
                        {transaction.action === 'issue' ? 'Выдача' : 
                         transaction.action === 'receive' ? 'Прием' : transaction.action}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(transaction.timestamp)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transaction.action === 'issue' ? (
                      <>
                        {transaction.issuedTo && (
                          <p><strong>Выдан:</strong> {transaction.issuedTo}</p>
                        )}
                        {transaction.handledBy && (
                          <p><strong>Выдал:</strong> {transaction.handledBy}</p>
                        )}
                      </>
                    ) : (
                      <>
                        {transaction.handledBy && (
                          <p><strong>Принял:</strong> {transaction.handledBy}</p>
                        )}
                        
                        {checklist && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Чек-лист:</h4>
                            <div className="space-y-1 text-sm">
                              {Object.entries(checklist).map(([key, value]) => {
                                if (key.endsWith('_comment')) return null;
                                const comment = checklist[`${key}_comment`];
                                const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                return (
                                  <div key={key} className="space-y-1">
                                    <div className="flex justify-between">
                                      <span className="capitalize">{label}:</span>
                                      <Badge variant={value ? 'default' : 'destructive'}>
                                        {value ? 'Да' : 'Нет'}
                                      </Badge>
                                    </div>
                                    {comment && (
                                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                        Комментарий: {comment}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {transaction.comments && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-1">Дополнительные замечания:</h4>
                            <p className="text-sm bg-muted p-2 rounded">
                              {transaction.comments}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
