import * as React from 'react';
import { TodoList } from '@/components/TodoList';
import { AddTodoForm } from '@/components/AddTodoForm';
import { useTodos } from '@/hooks/useTodos';

export function TodoPage() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Todo App</h1>
      <div className="space-y-6">
        <AddTodoForm onAddTodo={addTodo} />
        <TodoList 
          todos={todos} 
          onToggleTodo={toggleTodo} 
          onDeleteTodo={deleteTodo} 
        />
      </div>
    </div>
  );
}