import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Scan, Package, FileText, QrCode, Settings } from 'lucide-react';

export function HomePage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Учет стендов</h1>
        <p className="text-lg text-muted-foreground">
          Система учета и выдачи стендов с постерами и литературой
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Сканировать QR-код
            </CardTitle>
            <CardDescription>
              Отсканируйте QR-код стенда для выдачи или приема
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/scan">Открыть сканер</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Управление стендами
            </CardTitle>
            <CardDescription>
              Добавляйте, редактируйте и удаляйте стенды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/stands">Перейти к стендам</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Отчеты
            </CardTitle>
            <CardDescription>
              Просматривайте историю операций и экспортируйте в PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/reports">Посмотреть отчеты</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки чек-листа
            </CardTitle>
            <CardDescription>
              Настройте пункты проверки при приеме стендов
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/checklist-settings">Настроить</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Как использовать
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li>Создайте стенды в разделе "Стенды" и скачайте QR-коды</li>
          <li>Наклейте QR-коды на соответствующие стенды</li>
          <li>Используйте сканер для быстрой выдачи и приема стендов</li>
          <li>Заполняйте чек-листы при приеме стендов</li>
          <li>Настройте чек-лист под свои требования</li>
          <li>Просматривайте отчеты и экспортируйте их в PDF</li>
        </ol>
      </div>
    </div>
  );
}
