import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Package, Send, RotateCcw, Edit } from 'lucide-react';
import { IssueForm } from '@/components/IssueForm';
import { ReturnForm } from '@/components/ReturnForm';
import { Stand, StandTemplate, Material, Transaction } from '@/types';
import { 
  getStandById, 
  getTemplates, 
  getTemplateById, 
  getTemplateShelves, 
  getMaterialsByIds, 
  updateStand,
  getTransactions,
  getStandByQR
} from '@/lib/firestore';

export function StandDetailPage() {
  const { id: standId, qrCode } = useParams<{ id?: string; qrCode?: string }>();
  const navigate = useNavigate();
  const [stand, setStand] = useState<Stand | null>(null);
  const [template, setTemplate] = useState<StandTemplate | null>(null);
  const [shelfMaterials, setShelfMaterials] = useState<Map<number, Material[]>>(new Map());
  const [templates, setTemplates] = useState<StandTemplate[]>([]);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  useEffect(() => {
    if (standId) {
      fetchStandDataById();
    } else if (qrCode) {
      fetchStandDataByQR();
    }
  }, [standId, qrCode]);

  const fetchStandDataById = async () => {
    try {
      const standData = await getStandById(Number(standId));
      if (!standData) {
        setError('Стенд не найден');
        setLoading(false);
        return;
      }
      await loadStandData(standData);
    } catch (error) {
      console.error('Error fetching stand data by ID:', error);
      setError('Ошибка при загрузке данных стенда');
      setLoading(false);
    }
  };

  const fetchStandDataByQR = async () => {
    try {
      const standData = await getStandByQR(qrCode!);
      if (!standData) {
        setError('Стенд с таким QR-кодом не найден');
        setLoading(false);
        return;
      }
      await loadStandData(standData);
    } catch (error) {
      console.error('Error fetching stand data by QR:', error);
      setError('Ошибка при загрузке стенда');
      setLoading(false);
    }
  };

  const loadStandData = async (standData: Stand) => {
    try {
      setStand(standData);
      setSelectedTemplateId(standData.template_id || null);

      // Fetch templates
      const templatesData = await getTemplates();
      setTemplates(templatesData);

      // Fetch template data if stand has a template
      if (standData.template_id) {
        await loadTemplateData(standData.template_id);
      }

      // Fetch last transaction
      const transactions = await getTransactions();
      const standTransactions = transactions
        .filter(t => t.stand_id === standData.id)
        .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime());
      
      if (standTransactions.length > 0) {
        setLastTransaction(standTransactions[0]);
      }

    } catch (error) {
      console.error('Error loading stand data:', error);
      setError('Ошибка при загрузке данных стенда');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplateData = async (templateId: number) => {
    try {
      const [templateData, shelvesData] = await Promise.all([
        getTemplateById(templateId),
        getTemplateShelves(templateId)
      ]);

      setTemplate(templateData);

      // Load materials for shelves
      const materialIds = shelvesData.map(shelf => shelf.material_id);
      if (materialIds.length > 0) {
        const materials = await getMaterialsByIds(materialIds);
        const materialsMap = new Map<number, Material[]>();

        // Group materials by shelf number
        [1, 2, 3].forEach(shelfNumber => {
          const shelfMats = shelvesData
            .filter(shelf => shelf.shelf_number === shelfNumber)
            .map(shelf => materials.find(m => m.id === shelf.material_id))
            .filter(Boolean) as Material[];
          materialsMap.set(shelfNumber, shelfMats);
        });

        setShelfMaterials(materialsMap);
      }
    } catch (error) {
      console.error('Error loading template data:', error);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!stand) return;

    try {
      const newTemplateId = templateId ? Number(templateId) : null;
      await updateStand(stand.id, { template_id: newTemplateId });
      
      setSelectedTemplateId(newTemplateId);
      
      if (newTemplateId) {
        await loadTemplateData(newTemplateId);
      } else {
        setTemplate(null);
        setShelfMaterials(new Map());
      }
      
      setIsEditing(false);
      
      // Refresh stand data
      if (standId) {
        await fetchStandDataById();
      } else if (qrCode) {
        await fetchStandDataByQR();
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Ошибка при обновлении шаблона');
    }
  };

  const handleFormClose = () => {
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
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto text-center py-8">
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
    return null;
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
                {stand.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={stand.status === 'available' ? 'default' : 'secondary'}
                className="text-sm"
              >
                {stand.status === 'available' ? 'Доступен' : 'Выдан'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* Template Selection - only show for detail pages, not QR scan pages */}
      {standId && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Шаблон стенда</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Отмена' : 'Изменить'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <Label>Выберите шаблон</Label>
                <Select 
                  value={selectedTemplateId?.toString() || ''} 
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите шаблон" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Без шаблона</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">
                  {template ? template.theme : 'Без шаблона'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Preview */}
      {template && shelfMaterials.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Материалы на полках</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(shelfNumber => {
                const materials = shelfMaterials.get(shelfNumber) || [];
                return (
                  <div key={shelfNumber} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Полка {shelfNumber}</h4>
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div key={material.id} className="flex items-center gap-3">
                          {material.image_url && (
                            <img
                              src={material.image_url}
                              alt={material.name}
                              className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80"
                              onClick={() => {
                                const modal = document.createElement('div');
                                modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                modal.innerHTML = `
                                  <div class="relative">
                                    <img src="${material.image_url}" class="max-w-full max-h-full rounded-lg" />
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
                <Badge variant={lastTransaction.type === 'issue' ? 'default' : 'secondary'}>
                  {lastTransaction.type === 'issue' ? 'Выдача' : 'Прием'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Дата и время:</span>
                <span>{formatDate(lastTransaction.date_time)}</span>
              </div>
              {lastTransaction.type === 'issue' ? (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Выдан:</span>
                    <span>{lastTransaction.issued_to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Выдал:</span>
                    <span>{lastTransaction.issued_by}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="font-medium">Принял:</span>
                    <span>{lastTransaction.received_by}</span>
                  </div>
                  {lastTransaction.notes && (
                    <div>
                      <span className="font-medium">Замечания:</span>
                      <p className="mt-1 text-sm bg-muted p-2 rounded">{lastTransaction.notes}</p>
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
