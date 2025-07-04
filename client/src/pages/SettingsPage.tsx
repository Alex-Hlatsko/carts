import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Package, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MaterialsTab } from '@/components/settings/MaterialsTab';
import { TemplatesTab } from '@/components/settings/TemplatesTab';
import { ResponsiblePersonsTab } from '@/components/settings/ResponsiblePersonsTab';

export function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>
        <h1 className="text-3xl font-bold">Настройки</h1>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">
            <Package className="w-4 h-4 mr-2" />
            Шаблоны стендов
          </TabsTrigger>
          <TabsTrigger value="materials">
            <FileText className="w-4 h-4 mr-2" />
            Материалы
          </TabsTrigger>
          <TabsTrigger value="responsible">
            <Users className="w-4 h-4 mr-2" />
            Ответственные
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Шаблоны стендов</CardTitle>
              <CardDescription>
                Создавайте и редактируйте шаблоны стендов с материалами для полок
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplatesTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Материалы</CardTitle>
              <CardDescription>
                Управляйте библиотекой материалов для размещения на стендах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaterialsTab />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsible" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ответственные лица</CardTitle>
              <CardDescription>
                Добавляйте и управляйте списком ответственных лиц
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiblePersonsTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
