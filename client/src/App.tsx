import * as React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TodoPage } from '@/pages/TodoPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<TodoPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;