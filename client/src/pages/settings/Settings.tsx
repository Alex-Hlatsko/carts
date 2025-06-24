import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, Users } from 'lucide-react';

export function Settings() {
  return (
    <div className="pb-20 space-y-4">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>
      
      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Настроить чек-лист
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Добавить или изменить пункты чек-листа для отчётов</p>
        </CardContent>
      </Card>

      <Card className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Список ответственных
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Управление списком ответственных лиц</p>
        </CardContent>
      </Card>
    </div>
  );
}
