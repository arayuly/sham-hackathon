import React from 'react';
// 1. Добавляем импорты хуков из роутера
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  LayoutGrid, 
  FileSearch, 
  History, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

const Sidebar = () => {
  // 2. Инициализируем хуки
  const location = useLocation();
  const navigate = useNavigate();
  const lastId = localStorage.getItem('lastId') || '1';

  const menuItems = [
    { id: 'Upload', label: 'Upload & Analyze', icon: <UploadCloud size={20} />, path: '/' },
    { id: 'Dashboard', label: 'Dashboard', icon: <LayoutGrid size={20} />, path: `/result/${lastId}` },
    { id: 'AI Text Diff', label: 'AI Text Diff', icon: <FileSearch size={20} />, path: `/analysis/${lastId}` },
    { id: 'History', label: 'Document History', icon: <History size={20} />, path: '/history' },
    { id: 'Assistant', label: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/assistant' },
    { id: 'Settings', label: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="w-72 h-screen bg-white border-r border-slate-100 flex flex-col p-6 font-sans sticky top-0">
      
      {/* LOGO SECTION */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-black text-xl italic">S</span>
        </div>
        <div>
          <h1 className="text-[15px] font-black text-slate-800 leading-none tracking-tight">SHAM AI</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">
            TS Analysis Platform
          </p>
        </div>
      </div>

      {/* NAVIGATION LABEL */}
      <div className="px-4 mb-4">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Navigation
        </span>
      </div>

      {/* MENU ITEMS */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          // Проверка на активность: 
          // Либо полное совпадение, либо путь начинается с этой строки (для вложенных страниц)
          const isActive = item.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.path.replace('/latest', ''));

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-[#F0FDF4] text-[#10B981] shadow-sm shadow-emerald-100/50'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className={`${isActive ? 'text-[#10B981]' : 'text-slate-300 group-hover:text-slate-400'}`}>
                {item.icon}
              </span>
              <span className="text-[14px] font-bold tracking-tight">
                {item.label}
              </span>
              
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-[#10B981] rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* FOOTER STATUS */}
      <div className="mt-auto pt-6 border-t border-slate-50">
        <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
              System Online
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium italic">
            v2.4.1 — Multi-Agent Mode
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;