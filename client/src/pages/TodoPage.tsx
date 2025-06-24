import * as React from 'react';
import { TodoList } from '@/components/todo/TodoList';
import { AddTodoForm } from '@/components/todo/AddTodoForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TodoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Мои задачи</h1>
        <p className="text-muted-foreground">
          Управляйте своими задачами и отслеживайте прогресс
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Добавить новую задачу</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTodoForm />
        </CardContent>
      </Card>

      <TodoList />
    </div>
  );
}