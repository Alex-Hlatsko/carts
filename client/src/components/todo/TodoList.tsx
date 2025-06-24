import * as React from 'react';
import { useTodos } from '@/hooks/useTodos';
import { TodoItem } from './TodoItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TodoList() {
  const { todos, toggleTodo, deleteTodo } = useTodos();

  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            У вас пока нет задач. Добавьте первую задачу выше!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Список задач</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
          />
        ))}
      </CardContent>
    </Card>
  );
}