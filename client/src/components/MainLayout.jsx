import React from "react";
import { Outlet } from "react-router-dom";
import { Sparkles } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function MainLayout() {
  return (
    // Этот див - твой глобальный темный фон
    <div className="relative min-h-screen bg-[#0B0F19] text-white overflow-hidden">
      {/* Декоративные фоновые пятна (теперь они НЕ пропадут на странице результатов) */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none z-0" />

      {/* Контент страниц будет рендериться здесь через <Outlet /> */}
      <div className="relative z-10">
        <div className="fixed z-10 right-10 top-10">
          <LogoutButton />
        </div>
        {/* (СЮДА ПОТОМ МОЖНО ДОБАВИТЬ ОБЩИЙ NAVBAR, если он будет) */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
