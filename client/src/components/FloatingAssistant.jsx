import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, Minus } from 'lucide-react';
import api from "../api";

const FloatingAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  

  
  const lastId = localStorage.getItem('lastId');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newHistory = [...chatHistory, { text: message, isBot: false }];
    setChatHistory(newHistory);
    setMessage("");
    setIsTyping(true);

    try {
      const response = await api.post(`/documents/${lastId}/chat`, {
        message: chatMessage,
      });
      setChatHistory([
        ...newHistory,
        { text: response.data.reply, isBot: true },
      ]);
    } catch (error) {
      console.error("Ошибка чата:", error);
    } finally {
      setIsTyping(false);
    }
    
   
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      
      {/* ОКНО ЧАТА */}
      {isOpen && (
        <div className="mb-4 w-96 h-[500px] bg-white rounded-[24px] shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 origin-bottom-right">
          

          {/* MESSAGES */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 leading-relaxed">
                Привет! Задайте любой вопрос по текущему документу. 
              </div>
            </div>
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                  msg.isBot 
                    ? "bg-white border border-slate-100 rounded-tl-none text-slate-700" 
                    : "bg-[#10B981] text-white rounded-tr-none"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="text-[10px] text-slate-400 font-bold uppercase animate-pulse">ИИ думает...</div>
            )}
          </div>

          {/* INPUT */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Спросить ассистента..."
              className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button type="submit" className="bg-[#0F172A] text-white p-2 rounded-xl hover:bg-emerald-600 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* КНОПКА-ТРИГГЕР (Значок) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 ${
          isOpen ? "bg-white text-slate-800 rotate-90" : "bg-[#0F172A] text-white hover:bg-[#10B981] hover:shadow-emerald-200"
        }`}
      >
        {isOpen ? <X size={24} /> : (
          <div className="relative">
            <MessageSquare size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#0F172A] rounded-full" />
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingAssistant;