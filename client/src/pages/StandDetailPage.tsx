import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Send, RotateCcw } from 'lucide-react';
import { IssueForm } from '@/components/IssueForm';
import { ReturnForm } from '@/components/ReturnForm';
import { Stand } from '@/types';
import { getStandByQR } from '@/lib/firestore';

export function StandDetailPage() {
  const { qrCode } = useParams<{ qrCode: string }>();
  const navigate = useNavigate();
  const [stand, setStand] = useState<Stand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    if (qrCode) {
      fetchStand();
    }
  }, [qrCode]);

  const fetchStand = async () => {
    try {
      const standData = await getStandByQR(qrCode!);
      if (!standData) {
        setError('Стенд с таким QR-кодом не найден');
      } else {
        setStand(standData);
      }
    } catch (error) {
      console.error('Error fetching stand:', error);
      setError('Ошибка при загрузке стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowIssueForm(false);
    setShowReturnForm(false);
    fetchStand();
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
        <Card>
          <CardContent className="pt-6">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Стенд не найден</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/scan')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться к сканеру
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stand) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/scan')}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Назад к сканеру
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Стенд #{stand.number}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {stand.name}
              </p>
            </div>
            <Badge 
              variant={stand.status === 'available' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {stand.status === 'available' ? 'Доступен' : 'Выдан'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {stand.image_url && (
            <div className="mb-6">
              <img
                src={stand.image_url}
                alt={`Стенд ${stand.number}`}
                className="w-full max-w-sm mx-auto rounded-lg"
              />
            </div>
          )}
          
          <div className="flex gap-4 justify-center">
            {stand.status === 'available' ? (
              <Button 
                onClick={() => setShowIssueForm(true)}
                className="flex-1 max-w-xs"
              >
                <Send className="w-4 h-4 mr-2" />
                Выдать
              </Button>
            ) : (
              <Button 
                onClick={() => setShowReturnForm(true)}
                className="flex-1 max-w-xs"
                variant="secondary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Принять
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <IssueForm
        isOpen={showIssueForm}
        onClose={handleFormClose}
        stand={stand}
      />

      <ReturnForm
        isOpen={showReturnForm}
        onClose={handleFormClose}
        stand={stand}
      />
    </div>
  );
}
