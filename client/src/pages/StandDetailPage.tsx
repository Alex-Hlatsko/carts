import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Send, RotateCcw } from 'lucide-react';
import { IssueForm } from '@/components/IssueForm';
import { ReturnForm } from '@/components/ReturnForm';
import { Stand, Material, Transaction } from '@/types';
import { 
  getStandById, 
  getStandByQR,
  getMaterialsByIds, 
  getTransactions
} from '@/lib/firestore';

export function StandDetailPage() {
  const { id: standId, qrCode } = useParams<{ id?: string; qrCode?: string }>();
  const navigate = useNavigate();
  const [stand, setStand] = useState<Stand | null>(null);
  const [shelfMaterials, setShelfMaterials] = useState<Map<number, Material[]>>(new Map());
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    console.log('StandDetailPage: useEffect triggered', { standId, qrCode });
    if (standId) {
      fetchStandDataById();
    } else if (qrCode) {
      fetchStandDataByQR();
    } else {
      setError('Не указан ID или QR-код стенда');
      setLoading(false);
    }
  }, [standId, qrCode]);

  const fetchStandDataById = async () => {
    try {
      console.log('StandDetailPage: Fetching stand by ID:', standId);
      setLoading(true);
      setError(null);
      
      const standData = await getStandById(standId!);
      if (!standData) {
        setError('Стенд не найден');
        setLoading(false);
        return;
      }
      await loadStandData(standData);
    } catch (error) {
      console.error('StandDetailPage: Error fetching stand data by ID:', error);
      setError('Ошибка при загрузке данных стенда');
      setLoading(false);
    }
  };

  const fetchStandDataByQR = async () => {
    try {
      console.log('StandDetailPage: Fetching stand by QR:', qrCode);
      setLoading(true);
      setError(null);
      
      const standData = await getStandByQR(qrCode!);
      if (!standData) {
        setError('Стенд с таким QR-кодом не найден');
        setLoading(false);
        return;
      }
      await loadStandData(standData);
    } catch (error) {
      console.error('StandDetailPage: Error fetching stand data by QR:', error);
      setError('Ошибка при загрузке стенда');
      setLoading(false);
    }
  };

  const loadStandData = async (standData: Stand) => {
    try {
      console.log('StandDetailPage: Loading stand data:', standData);
      setStand(standData);

      // Load materials for shelves
      if (standData.shelves && standData.shelves.length > 0) {
        const allMaterialIds = standData.shelves.flatMap(shelf => shelf.materials || []);
        console.log('StandDetailPage: Material IDs to fetch:', allMaterialIds);
        
        if (allMaterialIds.length > 0) {
          const materials = await getMaterialsByIds(allMaterialIds);
          const materialsMap = new Map<number, Material[]>();

          standData.shelves.forEach(shelf => {
            const shelfMats = (shelf.materials || [])
              .map(matId => materials.find(m => m.id === matId))
              .filter(Boolean) as Material[];
            materialsMap.set(shelf.number, shelfMats);
          });

          console.log('StandDetailPage: Materials map:', materialsMap);
          setShelfMaterials(materialsMap);
        }
      }

      // Fetch last transaction
      const transactions = await getTransactions();
      const standTransactions = transactions
        .filter(t => t.standId === standData.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      if (standTransactions.length > 0) {
        console.log('StandDetailPage: Last transaction:', standTransactions[0]);
        setLastTransaction(standTransactions[0]);
      }

    } catch (error) {
      console.error('StandDetailPage: Error loading stand data:', error);
      setError('Ошибка при загрузке данных стенда');
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    console.log('StandDetailPage: Form closed, reloading data');
    setShowIssueForm(false);
    setShowReturnForm(false);
    if (standId) {
      fetchStandDataById();
    } else if (qrCode) {
      fetchStandDataByQR();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const handleBackNavigation = () => {
    if (qrCode) {
      navigate('/scan');
    } else {
      navigate('/stands');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка данных стенда...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleBackNavigation}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stand) {
    return (
      <div className="max-w-md mx-auto text-center py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Стенд не найден</h2>
            <Button onClick={handleBackNavigation}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4">
      <Button 
        variant="ghost" 
        onClick={handleBackNavigation}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {qrCode ? 'Назад к сканеру' : 'Назад к стендам'}
      </Button>

      {/* Stand Info */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                Стенд #{stand.number}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {stand.theme}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={stand.status === 'available' || stand.status === 'В Зале Царства' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {stand.status === 'available' ? 'Доступен' : 
                 stand.status === 'В Зале Царства' ? 'В Зале Царства' : 
                 stand.status === 'issued' ? 'Выдан' : stand.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {(stand.status === 'available' || stand.status === 'В Зале Царства') ? (
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

      {/* Materials on shelves */}
      {stand.shelves && stand.shelves.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Материалы на полках</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stand.shelves.map(shelf => {
                const materials = shelfMaterials.get(shelf.number) || [];
                return (
                  <div key={shelf.number} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Полка {shelf.number}</h4>
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div key={material.id} className="flex items-center gap-3">
                          {material.imageUrl && (
                            <img
                              src={material.imageUrl}
                              alt={material.name}
                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                modal.innerHTML = `
                                  <div class="relative max-w-full max-h-full">
                                    <img src="${material.imageUrl}" class="max-w-full max-h-full rounded-lg" />
                                    <button class="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100">
                                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                      </svg>
                                    </button>
                                  </div>
                                `;
                                modal.onclick = () => document.body.removeChild(modal);
                                document.body.appendChild(modal);
                              }}
                            />
                          )}
                          <span className="text-sm flex-1">{material.name}</span>
                        </div>
                      ))}
                      {materials.length === 0 && (
                        <p className="text-sm text-muted-foreground">Нет материалов</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Transaction */}
      {lastTransaction && (
        <Card>
          <CardHeader>
            <CardTitle>Последняя операция</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Тип операции:</span>
                <Badge variant={lastTransaction.action === 'issue' ? 'default' : 'secondary'}>
                  {lastTransaction.action === 'issue' ? 'Выдача' : 
                   lastTransaction.action === 'receive' ? 'Прием' : lastTransaction.action}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Дата и время:</span>
                <span>{formatDate(lastTransaction.timestamp)}</span>
              </div>
              {lastTransaction.action === 'issue' ? (
                <>
                  {lastTransaction.issuedTo && (
                    <div className="flex justify-between">
                      <span className="font-medium">Выдан:</span>
                      <span>{lastTransaction.issuedTo}</span>
                    </div>
                  )}
                  {lastTransaction.handledBy && (
                    <div className="flex justify-between">
                      <span className="font-medium">Выдал:</span>
                      <span>{lastTransaction.handledBy}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {lastTransaction.handledBy && (
                    <div className="flex justify-between">
                      <span className="font-medium">Принял:</span>
                      <span>{lastTransaction.handledBy}</span>
                    </div>
                  )}
                  {lastTransaction.comments && (
                    <div>
                      <span className="font-medium">Замечания:</span>
                      <p className="mt-1 text-sm bg-muted p-2 rounded">{lastTransaction.comments}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
