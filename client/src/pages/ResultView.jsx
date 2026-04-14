import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Send,
  Calendar,
  Target,
  DollarSign,
  Activity,
  Loader2,
} from "lucide-react";
import api from "../api";

export default function ResultView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);

  const [grantResult, setGrantResult] = useState(null);
  const [isCheckingGrant, setIsCheckingGrant] = useState(false);
  const [grantName, setGrantName] = useState(
    "Грант Министерства Науки и Высшего Образования РК",
  );

  const [templateMatch, setTemplateMatch] = useState(null);
  const [isMatching, setIsMatching] = useState(false);

  const [metrics, setMetrics] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const fetchAnalysis = async () => {
    try {
      const response = await api.get(`/documents/${id}/analysis`);
      setData(response.data);
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/documents/${id}/export-docx`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Улучшенное_ТЗ_SHAM_${id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Ошибка скачивания Word-документа:", error);
    }
  };

  const handleCheckGrant = async () => {
    setIsCheckingGrant(true);
    try {
      const response = await api.post(`/documents/${id}/check-grant`, {
        grant_name: grantName,
      });
      setGrantResult(response.data);
    } catch (error) {
      console.error("Ошибка проверки на грант:", error);
    } finally {
      setIsCheckingGrant(false);
    }
  };

  const handleCompareTemplate = async () => {
    setIsMatching(true);
    try {
      const response = await api.post(`/documents/${id}/compare-template`);
      setTemplateMatch(response.data);
    } catch (error) {
      console.error("Ошибка при сравнении с шаблоном:", error);
    } finally {
      setIsMatching(false);
    }
  };

  const handleExtractMetrics = async () => {
    setIsExtracting(true);
    try {
      const response = await api.get(`/documents/${id}/metrics`);
      setMetrics(response.data);
    } catch (error) {
      console.error("Ошибка при извлечении метрик:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newHistory = [...chatHistory, { text: chatMessage, isBot: false }];
    setChatHistory(newHistory);
    setChatMessage("");
    setIsChatting(true);

    try {
      const response = await api.post(`/documents/${id}/chat`, {
        message: chatMessage,
      });
      setChatHistory([
        ...newHistory,
        { text: response.data.reply, isBot: true },
      ]);
    } catch (error) {
      console.error("Ошибка чата:", error);
    } finally {
      setIsChatting(false);
    }
  };

  // Стилизованный экран загрузки
  if (!data)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 text-lg gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        Загрузка результатов анализа...
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
      {/* Левая колонка: Основной отчет */}
      <div className="flex-1 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />{" "}
          Назад к дашборду
        </button>

        {/* Шапка с оценкой (Glassmorphism) */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Результаты анализа ТЗ
            </h1>
            <p className="text-gray-500 mt-1">
              Система выявила ряд неточностей и подготовила рекомендации.
            </p>
          </div>
          <div className="bg-white/5 rounded-xl px-6 py-3 border border-white/10 text-center">
            <div
              className={`text-4xl font-extrabold ${
                data.score > 75
                  ? "text-emerald-400"
                  : data.score > 40
                    ? "text-yellow-400"
                    : "text-red-400"
              }`}
            >
              {data.score}/100
            </div>
            <div className="text-xs text-gray-500 mt-1">Оценка качества</div>
          </div>
        </div>

        {/* БЛОК: Экстрактор метрик и KPI */}
        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold flex items-center text-white">
                <Activity className="w-6 h-6 mr-2 text-blue-400" /> Извлеченные
                метрики (KPI)
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Автоматический поиск сроков, бюджетов и целевых показателей.
              </p>
            </div>
            {!metrics && (
              <button
                onClick={handleExtractMetrics}
                disabled={isExtracting}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold rounded-lg hover:bg-blue-500/20 transition disabled:opacity-50"
              >
                {isExtracting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isExtracting ? "Сканирование..." : "Найти KPI"}
              </button>
            )}
          </div>

          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-fade-in">
              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20">
                <div className="flex items-center mb-3 text-blue-400 font-bold">
                  <Calendar className="w-5 h-5 mr-2" /> Сроки и Даты
                </div>
                <ul className="text-sm text-blue-200/80 space-y-1">
                  {metrics.deadlines && metrics.deadlines.length > 0 ? (
                    metrics.deadlines.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))
                  ) : (
                    <li className="text-blue-400/50">Сроки не обнаружены</li>
                  )}
                </ul>
              </div>

              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                <div className="flex items-center mb-3 text-emerald-400 font-bold">
                  <DollarSign className="w-5 h-5 mr-2" /> Бюджет
                </div>
                <ul className="text-sm text-emerald-200/80 space-y-1">
                  {metrics.budget && metrics.budget.length > 0 ? (
                    metrics.budget.map((item, i) => <li key={i}>• {item}</li>)
                  ) : (
                    <li className="text-emerald-400/50">Бюджет не указан</li>
                  )}
                </ul>
              </div>

              <div className="bg-purple-500/10 p-4 rounded-xl border border-purple-500/20">
                <div className="flex items-center mb-3 text-purple-400 font-bold">
                  <Target className="w-5 h-5 mr-2" /> Показатели KPI
                </div>
                <ul className="text-sm text-purple-200/80 space-y-1">
                  {metrics.kpis && metrics.kpis.length > 0 ? (
                    metrics.kpis.map((item, i) => <li key={i}>• {item}</li>)
                  ) : (
                    <li className="text-purple-400/50">KPI не обнаружены</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* БЛОК: Нормоконтроль (Template Matcher) */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm p-6 rounded-2xl border border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Нормоконтроль (ГОСТ/Эталон)
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Проверка структуры документа на соответствие шаблону.
              </p>
            </div>
            {!templateMatch && (
              <button
                onClick={handleCompareTemplate}
                disabled={isMatching}
                className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition disabled:opacity-50"
              >
                {isMatching && <Loader2 className="w-4 h-4 animate-spin" />}
                {isMatching ? "Сверяю..." : "Запустить проверку"}
              </button>
            )}
          </div>

          {templateMatch && (
            <div className="mt-4 animate-fade-in">
              <div className="flex items-center mb-6">
                <div className="relative w-20 h-20 flex items-center justify-center bg-black/20 rounded-full border-4 border-violet-500/30 mr-4">
                  <span className="text-2xl font-black text-violet-400">
                    {templateMatch.match_percentage}%
                  </span>
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  Совпадение
                  <br />с эталонной структурой
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div className="bg-black/20 p-4 rounded-xl border border-red-500/20">
                  <span className="font-bold text-red-400">
                    ❌ Отсутствующие разделы:
                  </span>
                  <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
                    {templateMatch.missing_sections.length > 0 ? (
                      templateMatch.missing_sections.map((sec, i) => (
                        <li key={i}>{sec}</li>
                      ))
                    ) : (
                      <li className="text-gray-500">
                        Все разделы присутствуют
                      </li>
                    )}
                  </ul>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-yellow-500/20">
                  <span className="font-bold text-yellow-400">
                    ⚠️ Нестандартные разделы:
                  </span>
                  <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
                    {templateMatch.extra_sections.length > 0 ? (
                      templateMatch.extra_sections.map((sec, i) => (
                        <li key={i}>{sec}</li>
                      ))
                    ) : (
                      <li className="text-gray-500">Не обнаружено</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-violet-500/10 rounded-xl text-violet-200 text-sm font-medium border border-violet-500/20">
                📝 Вывод нормоконтролера: {templateMatch.conclusion}
              </div>
            </div>
          )}
        </div>

        {/* Блоки с ошибками */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
            <h3 className="font-bold text-red-400 flex items-center mb-3">
              <AlertTriangle className="w-5 h-5 mr-2" /> Логические ошибки
            </h3>
            <ul className="list-disc pl-5 text-sm text-red-200/70 space-y-1">
              {data.errors.logical_errors?.map((err, i) => (
                <li key={i}>{err}</li>
              )) || <li>Не найдено</li>}
            </ul>
          </div>
          <div className="bg-yellow-500/10 p-5 rounded-2xl border border-yellow-500/20">
            <h3 className="font-bold text-yellow-400 flex items-center mb-3">
              <AlertTriangle className="w-5 h-5 mr-2" /> Отсутствующие KPI
            </h3>
            <ul className="list-disc pl-5 text-sm text-yellow-200/70 space-y-1">
              {data.errors.missing_kpis?.map((err, i) => (
                <li key={i}>{err}</li>
              )) || <li>Не найдено</li>}
            </ul>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
          <h2 className="text-xl font-bold text-emerald-400 flex items-center mb-4">
            <CheckCircle className="w-6 h-6 mr-2" /> Рекомендации по улучшению
          </h2>
          <ul className="space-y-2 text-emerald-200/80">
            {data.improvements?.map((rec, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 text-emerald-400 font-bold">•</span> {rec}
              </li>
            ))}
          </ul>
          <button
            onClick={handleDownload}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition font-medium"
          >
            <Download className="w-4 h-4" /> Скачать улучшенное ТЗ (.docx)
          </button>
        </div>

        {/* БЛОК: Проверка на Гранты */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 p-6 rounded-2xl border border-indigo-500/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Проверка на соответствие грантам
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Оцените шансы ТЗ пройти формальную экспертизу.
              </p>
            </div>
            {!grantResult && (
              <button
                onClick={handleCheckGrant}
                disabled={isCheckingGrant}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition disabled:opacity-50"
              >
                {isCheckingGrant && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {isCheckingGrant ? "Анализирую..." : "Запустить проверку"}
              </button>
            )}
          </div>

          {grantResult && (
            <div className="mt-4 animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="text-4xl font-black text-indigo-400 mr-4">
                  {grantResult.compliance_score}%
                </div>
                <div className="text-sm text-gray-300 font-medium">
                  Готовность к подаче
                  <br />
                  на грант
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-black/20 p-4 rounded-xl border border-emerald-500/20">
                  <span className="font-bold text-emerald-400">
                    ✅ Присутствует:
                  </span>
                  <ul className="list-disc pl-5 mt-1 text-gray-300">
                    {grantResult.present_sections.map((sec, i) => (
                      <li key={i}>{sec}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-red-500/20">
                  <span className="font-bold text-red-400">
                    ❌ Отсутствует (Критично):
                  </span>
                  <ul className="list-disc pl-5 mt-1 text-gray-300">
                    {grantResult.missing_sections.map((sec, i) => (
                      <li key={i}>{sec}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-indigo-500/10 rounded-xl text-indigo-200 text-sm font-medium border border-indigo-500/20">
                💡 Совет эксперта: {grantResult.expert_advice}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Правая колонка: Чат с AI (Dark Style) */}
      <div className="w-full lg:w-[400px] bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col h-[650px] shadow-2xl">
        <div className="p-4 bg-white/[0.05] border-b border-white/10 rounded-t-2xl font-bold flex items-center text-violet-400">
          <MessageSquare className="w-5 h-5 mr-2" /> AI-Ассистент
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col">
          <div className="bg-white/[0.05] text-gray-300 p-3 rounded-xl rounded-tl-none text-sm border border-white/5">
            Привет! Я проанализировал документ. Задайте мне любой вопрос по
            этому ТЗ или попросите переписать конкретный пункт.
          </div>
          <div className="flex-1" /> {/* Отступ, чтобы прижимать к низу */}
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`p-3 rounded-xl text-sm max-w-[85%] ${
                  msg.isBot
                    ? "bg-white/[0.05] text-gray-300 rounded-tl-none border border-white/5"
                    : "bg-violet-600 text-white rounded-tr-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex items-center gap-2 text-gray-500 text-sm italic pl-2">
              <div
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          )}
        </div>

        <form
          onSubmit={sendChatMessage}
          className="p-3 border-t border-white/10 flex gap-2 rounded-b-2xl"
        >
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Спросите AI..."
            className="flex-1 p-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition"
          />
          <button
            type="submit"
            className="bg-violet-600 text-white p-2.5 rounded-xl hover:bg-violet-500 transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
