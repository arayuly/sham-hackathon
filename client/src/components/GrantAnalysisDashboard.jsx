import React, { useState, useMemo } from 'react';

// Иконки берем из lucide-react
import { 
  Target, Lightbulb, Zap, CheckCircle2, TrendingUp, ShieldCheck, Key,
  AlertTriangle, MessageSquare, Info 
} from 'lucide-react';

// Графики берем из recharts
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,PolarRadiusAxis, Tooltip
} from 'recharts';

const CRITERIA_CONFIG = {
  goals_tasks: { label: "Цель и задачи", icon: Target, color: "#3B82F6" },
  scientific_novelty: { label: "Научная новизна", icon: Lightbulb, color: "#A855F7" },
  practical_applicability: { label: "Практическая применимость", icon: Zap, color: "#F59E0B" },
  expected_results: { label: "Ожидаемые результаты", icon: CheckCircle2, color: "#10B981" },
  socio_economic_effect: { label: "Соц-экономический эффект", icon: TrendingUp, color: "#EC4899" },
  feasibility: { label: "Реализуемость", icon: ShieldCheck, color: "#64748B" },
  strategic_relevance: { label: "Стратегическая релевантность", icon: Key, color: "#EF4444" }
};

export default function GrantAnalysisDashboard({ data,isDark }) {
  const { original_text, found_issues, criteria_analysis } = data;
  const [selectedIssue, setSelectedIssue] = useState(null);

  // 1. Подготовка данных для радара
  const radarData = criteria_analysis.map(c => ({
    subject: c.label,
    A: c.score,
    fullMark: 10,
    explanation: c.explanation
  }));

  // 2. Логика подсветки текста (разбиваем строку на части)
 const highlightedContent = useMemo(() => {
  if (!original_text) return null;
  
  // 1. Создаем массив объектов с позициями всех найденных проблем
  let fragments = [{ text: original_text, isIssue: false }];

  found_issues.forEach((issue) => {
    const nextFragments = [];
    
    fragments.forEach(fragment => {
      if (fragment.isIssue) {
        nextFragments.push(fragment);
        return;
      }

      const parts = fragment.text.split(issue.phrase);
      parts.forEach((part, index) => {
        if (part) nextFragments.push({ text: part, isIssue: false });
        
        // Если это не последний кусок, значит между ними была фраза-проблема
        if (index < parts.length - 1) {
          nextFragments.push({ 
            text: issue.phrase, 
            isIssue: true, 
            issueData: issue 
          });
        }
      });
    });
    fragments = nextFragments;
  });

  // 2. Рендерим фрагменты в JSX
  return fragments.map((frag, i) => {
    if (!frag.isIssue) return <span key={i}>{frag.text}</span>;

    const isSelected = selectedIssue?.phrase === frag.issueData.phrase;

    return (
      <mark
        key={i}
        onClick={() => setSelectedIssue(frag.issueData)}
        className={`
          cursor-pointer px-1 rounded-md transition-all duration-200 border-b-2
          ${isSelected 
            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_0_10px_var(--accent)]/30' 
            : 'bg-amber-500/20 text-[var(--foreground)] border-amber-500/50 hover:bg-amber-500/30'
          }
        `}
      >
        {frag.text}
      </mark>
    );
  });
}, [original_text, found_issues, selectedIssue]);

  return (
   <div className="flex flex-col h-screen bg-[var(--background)] transition-colors duration-300">
  {/* Header: теперь адаптивный */}
  <div className="h-16 bg-[var(--card)] border-b border-[var(--card-border)] px-8 flex items-center justify-between shadow-sm z-10">
    <h2 className="font-black text-[var(--foreground)] flex items-center gap-3 tracking-tight">
      <ShieldCheck className="text-[var(--accent)]" size={22}/> 
      AI Spec Analyzer Pro
    </h2>
    
    {/* Мини-индикаторы в хедере */}
    <div className="flex gap-6">
      {criteria_analysis.map(c => (
         <div key={c.id} className="flex flex-col items-end">
           <span className="text-[9px] text-[var(--muted)] uppercase font-black tracking-widest">{c.weight}</span>
           <div className="w-12 h-1.5 bg-[var(--hover)] rounded-full mt-1 overflow-hidden border border-[var(--card-border)]">
             <div 
               className="h-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" 
               style={{width: `${c.score*10}%`}} 
             />
           </div>
         </div>
      ))}
    </div>
  </div>

  <div className="flex flex-1 overflow-hidden p-6 gap-6">
    
    {/* ЛЕВАЯ ПАНЕЛЬ: Текст ТЗ */}
    <div className="flex-[2] bg-[var(--card)] rounded-[32px] shadow-sm border border-[var(--card-border)] flex flex-col overflow-hidden backdrop-blur-md">
      <div className="p-5 border-b border-[var(--card-border)] bg-[var(--hover)] opacity-80 flex items-center justify-between">
        <span className="text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.1em] flex items-center gap-2">
          <MessageSquare size={14}/> Оригинальный текст с правками
        </span>
      </div>
      <div className="p-10 overflow-y-auto leading-loose text-[var(--foreground)] font-serif text-xl selection:bg-[var(--accent)] selection:text-white">
        {highlightedContent}
      </div>
    </div>

    {/* ПРАВАЯ ПАНЕЛЬ: Аналитика */}
    <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
      
      {/* Радарная диаграмма (адаптация цветов графика) */}
      <div className="bg-[var(--card)] p-8 rounded-[32px] shadow-sm border border-[var(--card-border)]">
        <h3 className="text-[11px] font-black text-[var(--muted)] mb-6 uppercase tracking-widest">Баланс критериев</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData}> {/* Используем наш преобразованный массив */}
            <PolarGrid stroke="var(--card-border)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{fontSize: 10, fill: 'var(--muted)', fontWeight: 700}} 
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                   <div className="bg-card/95 backdrop-blur-sm p-3 border border-border rounded-xl shadow-xl max-w-[240px] animate-in fade-in zoom-in duration-200">
                      {/* Заголовок с индикатором балла */}
                      <div className="flex items-center justify-between mb-2 gap-4">
                        <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                          {data.subject}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          data.A >= 8 ? 'bg-emerald-500/10 text-emerald-500' : 
                          data.A >= 5 ? 'bg-amber-500/10 text-amber-500' : 
                          'bg-rose-500/10 text-rose-500'
                        }`}>
                          {data.A}/10
                        </div>
                      </div>

                      {/* Разделитель */}
                      <div className="h-[1px] w-full bg-border/50 mb-2" />

                      {/* Текст объяснения */}
                      <p className="text-sm leading-relaxed text-foreground/90">
                        {data.explanation}
                      </p>
                      
                      {/* Декоративный элемент снизу */}
                      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/60 italic">
                        <div className="w-1 h-1 rounded-full bg-accent" />
                        AI Analysis
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            
            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
            
            <Radar 
              name="Балл" 
              dataKey="A" 
              stroke="var(--accent)" 
              fill="var(--accent)" 
              fillOpacity={isDark ? 0.3 : 0.5} 
            />
          </RadarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Карточка конкретной проблемы (SMART) */}
      <div className="flex-1">
        {selectedIssue ? (
          <div className="bg-[#1E293B] dark:bg-white/[0.05] text-white p-8 rounded-[32px] shadow-2xl sticky top-0 animate-in fade-in zoom-in-95 duration-300 border border-white/10 backdrop-blur-xl">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-tighter">
                {selectedIssue.category}
              </span>
              {(() => {
                const config = CRITERIA_CONFIG[selectedIssue.criterion];
                const Icon = config?.icon || Info;
                return (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Icon size={16} style={{color: config?.color}} />
                    <span className="text-[10px] font-black uppercase tracking-wider">{config?.label}</span>
                  </div>
                );
              })()}
            </div>
            
            <p className="text-slate-400 text-[10px] mb-2 uppercase font-black tracking-widest opacity-60">Проблема в тексте:</p>
            <p className="text-xl font-medium mb-8 italic leading-snug border-l-2 border-blue-500/30 pl-4">
              "{selectedIssue.phrase}"
            </p>
            
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[24px] shadow-inner shadow-emerald-500/5">
              <h4 className="text-emerald-400 text-[10px] font-black flex items-center gap-2 mb-3 uppercase tracking-[0.1em]">
                <Zap size={14} className="fill-emerald-400"/> Рекомендуемое исправление (SMART)
              </h4>
              <p className="text-emerald-50 text-lg leading-relaxed font-medium">
                {selectedIssue.replacement}
              </p>
            </div>
            
            <button 
              onClick={() => setSelectedIssue(null)}
              className="mt-8 w-full text-center text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Закрыть детализацию
            </button>
          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-[var(--card-border)] rounded-[32px] flex flex-col items-center justify-center p-12 text-center bg-[var(--card)] opacity-60">
            <div className="w-20 h-20 bg-[var(--hover)] rounded-full flex items-center justify-center mb-6 text-[var(--muted)]">
              <Info size={40} />
            </div>
            <p className="font-black text-[var(--foreground)] uppercase text-sm tracking-wider">Правки не выбраны</p>
            <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed max-w-[200px]">
              Кликните на выделенное слово в тексте, чтобы увидеть решение от ИИ
            </p>
          </div>
        )}
      </div>

    </div>
  </div>
</div>
  );
}