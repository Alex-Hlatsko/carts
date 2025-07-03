import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { Transaction, Stand } from '@/types';
import { getTransactions, getStands } from '@/lib/firestore';

export function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stands, setStands] = useState<Map<number, Stand>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsData, standsData] = await Promise.all([
        getTransactions(),
        getStands()
      ]);
      
      setTransactions(transactionsData);
      
      // Create stands map for quick lookup
      const standsMap = new Map<number, Stand>();
      standsData.forEach(stand => {
        standsMap.set(stand.id, stand);
      });
      setStands(standsMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const parseChecklist = (checklistData: string | null | undefined) => {
    if (!checklistData) return null;
    try {
      return JSON.parse(checklistData);
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
            const stand = stands.get(transaction.stand_id);
            const checklist = parseChecklist(transaction.checklist_data);
            
            return (
              <Card key={transaction.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <CardTitle className="text-lg">
                        Стенд #{stand?.number || transaction.stand_id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {stand?.name || 'Неизвестный стенд'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.type === 'issue' ? 'default' : 'secondary'}>
                        {transaction.type === 'issue' ? 'Выдача' : 'Прием'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(transaction.date_time)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {transaction.type === 'issue' ? (
                      <>
                        <p><strong>Выдан:</strong> {transaction.issued_to}</p>
                        <p><strong>Выдал:</strong> {transaction.issued_by}</p>
                      </>
                    ) : (
                      <>
                        <p><strong>Принял:</strong> {transaction.received_by}</p>
                        
                        {checklist && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Чек-лист:</h4>
                            <div className="space-y-1 text-sm">
                              {Object.entries(checklist).map(([key, value]) => {
                                if (key.endsWith('_comment')) return null;
                                const comment = checklist[`${key}_comment`];
                                const label = key.replace(/_/g, ' ');
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
                        
                        {transaction.notes && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-1">Дополнительные замечания:</h4>
                            <p className="text-sm bg-muted p-2 rounded">
                              {transaction.notes}
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
