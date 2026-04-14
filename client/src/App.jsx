import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar"; 
import Dashboard from "./pages/Dashboard";
import ResultView from "./pages/ResultView"; 
import AnalysisPage from "./pages/AnalysisPage";
import { useState, useEffect } from "react";
import { FileText } from 'lucide-react';
import FloatingAssistant from "./components/FloatingAssistant";
function App() {
  const [currentFileName, setCurrentFileName] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem('lastFileName');
    if (savedName) setCurrentFileName(savedName);
  }, []);

  const handleFileSelect = (id, name) => {
    localStorage.setItem('lastId', id);
    localStorage.setItem('lastFileName', name);
    setCurrentFileName(name);
  };
  return (
   

    <Router>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        
        {/* Теперь Sidebar внутри Router, и ошибка исчезнет */}
        <Sidebar />

        <div className="flex-1 flex flex-col h-screen overflow-hidden">
         <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8">
            <div className="flex items-center gap-3">
              {currentFileName && (
                <>
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 truncate max-w-[300px]">
                    {currentFileName}
                  </span>
                </>
              )}
            </div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
              Hackathon Prototype v1.0
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <Routes>
 
            <Route 
              path="/" 
              element={<Dashboard onFileSelect={handleFileSelect} />} 
            />
            <Route 
              path="/result/:id"  
              element={<ResultView onFileSelect={handleFileSelect}/>} 
            />
            <Route 
              path="/analysis/:id" 
              element={<AnalysisPage onFileSelect={handleFileSelect} />} 
            />
            <Route 
              path="/analysis/latest" 
              element={<AnalysisPage isLatest={true} onFileSelect={handleFileSelect} />} 
            />
          </Routes>
          </main>
        </div>

        <FloatingAssistant 
        />

      </div>
    </Router>
  );
}

export default App;