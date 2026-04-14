import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Send,
} from "lucide-react";
import api from "../api";

export default function ResultView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
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
      const response = await api.get(`/documents/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `improved_tz_${id}.txt`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Ошибка скачивания:", error);
    }
  };

 

  if (!data)
    return (
      <div className="p-10 text-center text-xl">Загрузка результатов...</div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 flex flex-col lg:flex-row gap-6">
      {/* Левая колонка: Основной отчет */}
      <div className="flex-1 space-y-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Назад к дашборду
        </button>

        <div className="bg-white p-6 rounded-xl shadow border-t-4 border-primary flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Результаты анализа ТЗ</h1>
            <p className="text-gray-500">
              Система выявила ряд неточностей и подготовила рекомендации.
            </p>
          </div>
          <div className="text-center">
            <div
              className={`text-4xl font-extrabold ${data.score > 75 ? "text-green-500" : data.score > 40 ? "text-yellow-500" : "text-red-500"}`}
            >
              {data.score}/100
            </div>
            <div className="text-sm text-gray-500">Оценка качества</div>
          </div>
        </div>

        {/* Блоки с ошибками */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-bold text-red-700 flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" /> Логические ошибки
            </h3>
            <ul className="list-disc pl-5 text-sm text-red-900 space-y-1">
              {data.errors.logical_errors?.map((err, i) => (
                <li key={i}>{err}</li>
              )) || <li>Не найдено</li>}
            </ul>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <h3 className="font-bold text-orange-700 flex items-center mb-2">
              <AlertTriangle className="w-5 h-5 mr-2" /> Отсутствующие KPI
            </h3>
            <ul className="list-disc pl-5 text-sm text-orange-900 space-y-1">
              {data.errors.missing_kpis?.map((err, i) => (
                <li key={i}>{err}</li>
              )) || <li>Не найдено</li>}
            </ul>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-100">
          <h2 className="text-xl font-bold text-green-800 flex items-center mb-4">
            <CheckCircle className="w-6 h-6 mr-2" /> Рекомендации по улучшению
          </h2>
          <ul className="space-y-2 text-green-900">
            {data.improvements?.map((rec, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2 text-green-500 font-bold">•</span> {rec}
              </li>
            ))}
          </ul>
          <button
            onClick={handleDownload}
            className="mt-6 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4 mr-2" /> Скачать улучшенное ТЗ
          </button>
        </div>
      </div>

      
      
    </div>
  );
}
