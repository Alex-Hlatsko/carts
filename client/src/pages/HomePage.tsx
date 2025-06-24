import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckSquare, QrCode, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Добро пожаловать!</h1>
        <p className="text-xl text-muted-foreground">
          Ваше персональное приложение для управления задачами и работы с QR-кодами
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckSquare className="h-5 w-5 mr-2" />
              Задачи
            </CardTitle>
            <CardDescription>
              Управляйте своими задачами и отслеживайте прогресс
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/todos">Открыть задачи</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              QR коды
            </CardTitle>
            <CardDescription>
              Создавайте и сканируйте QR-коды
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/qr">Работать с QR</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Настройки
            </CardTitle>
            <CardDescription>
              Настройте приложение под себя
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" className="w-full">
              Скоро доступно
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}