import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, QrCode, FileText } from 'lucide-react';
import { StandForm } from '@/components/StandForm';
import { Stand, TransactionWithService } from '@/types';
import { getStands, deleteStand, getTransactions } from '@/lib/firestore';
import QRCodeLib from 'qrcode';

interface StandWithTemplate extends Stand {
  template_theme?: string;
}

export function StandsPage() {
  const [stands, setStands] = useState<StandWithTemplate[]>([]);
  const [transactions, setTransactions] = useState<TransactionWithService[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStand, setEditingStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStands();
    fetchTransactions();
  }, []);

  const fetchStands = async () => {
    try {
      const data = await getStands();
      setStands(data);
    } catch (error) {
      console.error('Error fetching stands:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const getLastReport = (standId: string) => {
    const standTransactions = transactions
      .filter(t => t.stand_id === standId && t.type === 'return')
      .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
    
    return standTransactions[0] || null;
  };

  const handleEdit = (stand: Stand) => {
    setEditingStand(stand);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот стенд?')) {
      return;
    }

    try {
      await deleteStand(id);
      fetchStands();
    } catch (error) {
      console.error('Error deleting stand:', error);
    }
  };

  const handleDownloadQR = async (qrCode: string, standNumber: string) => {
    try {
      const qrCodeDataURL = await QRCodeLib.toDataURL(qrCode, {
        width: 200,
        margin: 2
      });
      
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `stand-${standNumber}-qr.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingStand(null);
    fetchStands();
    fetchTransactions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Стенды</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить стенд
        </Button>
      </div>

      {stands.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              У вас пока нет стендов
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить первый стенд
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stands.map((stand) => {
            const lastReport = getLastReport(stand.id);
            
            return (
              <Card key={stand.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Стенд #{stand.number}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {stand.name}
                      </p>
                      {stand.template_theme && (
                        <p className="text-sm text-blue-600 mt-1">
                          Шаблон: {stand.template_theme}
                        </p>
                      )}
                    </div>
                    <Badge variant={stand.status === 'available' ? 'default' : 'secondary'}>
                      {stand.status === 'available' ? 'Доступен' : 'Выдан'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {stand.image_url && (
                    <div className="mb-4">
                      <img
                        src={stand.image_url}
                        alt={`Стенд ${stand.number}`}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  {lastReport && (
                    <div className="mb-4 p-3 bg-muted rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm font-medium">Последний отчет</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(lastReport.date_time)} - {lastReport.received_by}
                      </p>
                      {lastReport.service && (
                        <Badge variant="outline" className="mt-1">
                          Обслужено {formatDate(lastReport.service.serviced_at)}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadQR(stand.qr_code, stand.number)}
                    >
                      <QrCode className="w-4 h-4 mr-1" />
                      QR
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(stand)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(stand.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <StandForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        stand={editingStand}
      />
    </div>
  );
}
