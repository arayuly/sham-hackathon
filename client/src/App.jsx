import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ResultView from "./pages/ResultView"; // Создадим этот компонент следующим шагом

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans text-gray-900">
        {/* Базовый Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-xl font-bold text-primary">SHAM.AI</div>
            <div className="text-sm text-gray-500">Hackathon Prototype</div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/result/:id" element={<ResultView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
