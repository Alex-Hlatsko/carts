import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Wrench, ArrowLeft } from 'lucide-react';
import { TransactionWithService, ResponsiblePerson } from '@/types';
import { getTransactions, getResponsiblePersons, createStandService } from '@/lib/firestore';

export function ReportsPage() {
  const [transactions, setTransactions] = useState<TransactionWithService[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<ResponsiblePerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState<{
    isOpen: boolean;
    transaction: TransactionWithService | null;
  }>({ isOpen: false, transaction: null });
  const [serviceComment, setServiceComment] = useState('');
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [isServicing, setIsServicing] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchResponsiblePersons();
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponsiblePersons = async () => {
    try {
      const data = await getResponsiblePersons();
      setResponsiblePersons(data);
    } catch (error) {
      console.error('Error fetching responsible persons:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const parseChecklist = (checklistData: string | null) => {
    if (!checklistData) return null;
    try {
      return JSON.parse(checklistData);
    } catch {
      return null;
    }
  };

  const needsService = (transaction: TransactionWithService) => {
    if (transaction.type !== 'return' || transaction.service) return false;
    
    const checklist = parseChecklist(transaction.checklist_data);
    if (!checklist) return false;
    
    // Check if any checkbox is "No" or if there are comments
    const hasNegativeAnswer = Object.entries(checklist).some(([key, value]) => {
      if (key.endsWith('_comment')) return false;
      return value === false;
    });
    
    const hasComments = Object.entries(checklist).some(([key, value]) => {
      if (!key.endsWith('_comment')) return false;
      return typeof value === 'string' && value.trim().length > 0;
    });
    
    return hasNegativeAnswer || hasComments || !!transaction.notes;
  };

  const handleServiceClick = (transaction: TransactionWithService) => {
    setServiceModal({ isOpen: true, transaction });
    setServiceComment('');
    setSelectedResponsible('');
  };

  const handleServiceSubmit = async () => {
    if (!serviceModal.transaction || !selectedResponsible) return;
    
    setIsServicing(true);
    try {
      await createStandService({
        transaction_id: serviceModal.transaction.id,
        responsible_person_id: selectedResponsible,
        comment: serviceComment || null
      });

      setServiceModal({ isOpen: false, transaction: null });
      fetchTransactions();
    } catch (error) {
      console.error('Error servicing transaction:', error);
      alert('Ошибка при обслуживании');
    } finally {
      setIsServicing(false);
    }
  };

  const handleExportPDF = () => {
    // This would be implemented with a PDF library like jsPDF
    alert('Функция экспорта в PDF будет добавлена в следующем обновлении');
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Отчеты</h1>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="w-4 h-4 mr-2" />
          Экспорт в PDF
        </Button>
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
            const checklist = parseChecklist(transaction.checklist_data);
            const requiresService = needsService(transaction);
            
            return (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Стенд #{transaction.stand_number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {transaction.stand_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={transaction.type === 'issue' ? 'default' : 'secondary'}>
                        {transaction.type === 'issue' ? 'Выдача' : 'Прием'}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(transaction.date_time)}
                      </p>
                      {transaction.service && (
                        <Badge variant="outline" className="mt-1">
                          Обслужено {formatDate(transaction.service.serviced_at)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.stand_image_url && (
                      <div>
                        <img
                          src={transaction.stand_image_url}
                          alt={`Стенд ${transaction.stand_number}`}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                    
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
                          {transaction.service && (
                            <div className="mt-4">
                              <h4 className="font-semibold mb-1">Обслуживание:</h4>
                              <p className="text-sm"><strong>Ответственный:</strong> {transaction.service.responsible_person_name}</p>
                              <p className="text-sm"><strong>Дата:</strong> {formatDate(transaction.service.serviced_at)}</p>
                              {transaction.service.comment && (
                                <p className="text-sm bg-muted p-2 rounded mt-1">
                                  <strong>Комментарий:</strong> {transaction.service.comment}
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {requiresService && (
                    <div className="mt-4 pt-4 border-t">
                      <Button 
                        onClick={() => handleServiceClick(transaction)}
                        variant="outline"
                        className="w-full"
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Обслужить
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={serviceModal.isOpen} onOpenChange={(open) => 
        setServiceModal({ isOpen: open, transaction: null })
      }>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Обслуживание стенда #{serviceModal.transaction?.stand_number}
            </DialogTitle>
          </DialogHeader>
          
          {serviceModal.transaction && (
            <div className="space-y-4">
              {/* Show full report */}
              <div className="border rounded p-4 bg-muted">
                <h4 className="font-semibold mb-2">Отчет о приеме</h4>
                <p className="text-sm"><strong>Дата:</strong> {formatDate(serviceModal.transaction.date_time)}</p>
                <p className="text-sm"><strong>Принял:</strong> {serviceModal.transaction.received_by}</p>
                
                {(() => {
                  const checklist = parseChecklist(serviceModal.transaction.checklist_data);
                  if (checklist) {
                    return (
                      <div className="mt-3">
                        <h5 className="font-medium mb-2">Чек-лист:</h5>
                        <div className="space-y-2">
                          {Object.entries(checklist).map(([key, value]) => {
                            if (key.endsWith('_comment')) return null;
                            const comment = checklist[`${key}_comment`];
                            const label = key.replace(/_/g, ' ');
                            return (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize">{label}:</span>
                                  <Badge variant={value ? 'default' : 'destructive'} className="text-xs">
                                    {value ? 'Да' : 'Нет'}
                                  </Badge>
                                </div>
                                {comment && (
                                  <p className="text-xs text-muted-foreground bg-background p-2 rounded">
                                    Комментарий: {comment}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {serviceModal.transaction.notes && (
                  <div className="mt-3">
                    <h5 className="font-medium mb-1">Дополнительные замечания:</h5>
                    <p className="text-sm bg-background p-2 rounded">
                      {serviceModal.transaction.notes}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="service_comment">Комментарий по обслуживанию</Label>
                <Textarea
                  id="service_comment"
                  value={serviceComment}
                  onChange={(e) => setServiceComment(e.target.value)}
                  placeholder="Опишите выполненные работы..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="responsible">Ответственный за обслуживание</Label>
                <Select onValueChange={setSelectedResponsible} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите ответственного" />
                  </SelectTrigger>
                  <SelectContent>
                    {responsiblePersons.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setServiceModal({ isOpen: false, transaction: null })}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
                <Button 
                  onClick={handleServiceSubmit}
                  disabled={!selectedResponsible || isServicing}
                >
                  {isServicing ? 'Обслуживание...' : 'Обслужено'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
