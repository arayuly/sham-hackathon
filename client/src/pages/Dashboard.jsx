import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

// Вспомогательная функция для цвета оценки (чтобы было красиво в таблице)
const getScoreStyles = (score) => {
  if (!score) return "text-gray-500";
  if (score >= 70)
    return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (score >= 40)
    return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  return "bg-red-500/10 text-red-400 border border-red-500/20";
};

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get("/documents/");
      setDocuments(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке истории:", error);
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await api.post(
          "/documents/upload-and-analyze/",
          formData,
        );
        navigate(`/result/${response.data.document_id}`);
      } catch (error) {
        console.error("Ошибка загрузки:", error);
        alert("Не удалось проанализировать документ");
      } finally {
        setIsUploading(false);
      }
    },
    [navigate],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
  });

  return (
    // Основной контейнер (Темный фон)
    <div className=" max-w-5xl mx-auto p-8 pt-16">
      {/* Декоративные фоновые пятна (Blur-эффект) */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />

      {/* Контент */}
      <div className="relative z-10 max-w-5xl mx-auto p-8 pt-16">
        {/* Заголовок */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-violet-400 mb-3 font-medium tracking-wide">
            <Sparkles className="w-5 h-5" />
            <span>Powered by AI</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
            Анализатор ТЗ
          </h1>
          <p className="text-gray-500 text-lg">
            Загрузите документ, чтобы получить детальный отчет о качестве
            требований
          </p>
        </div>

        {/* Зона загрузки файлов (Glassmorphism) */}
        <div
          {...getRootProps()}
          className={`relative group border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${
            isDragActive
              ? "border-violet-500 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.15)] scale-[1.02]"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20"
          }`}
        >
          <input {...getInputProps()} />

          {isUploading ? (
            <div className="flex flex-col items-center text-violet-400">
              <div className="relative mb-6">
                <Loader2 className="w-16 h-16 animate-spin" />
                <div className="absolute inset-0 w-16 h-16 bg-violet-500/30 blur-xl rounded-full animate-ping" />
              </div>
              <p className="text-xl font-semibold">
                ИИ анализирует документ...
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Это займет пару секунд
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center text-gray-400 group-hover:text-gray-300 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-violet-500/10 transition-colors">
                <UploadCloud className="w-8 h-8 text-violet-400" />
              </div>
              <p className="text-xl font-medium text-white mb-2">
                Перетащите файл ТЗ сюда
              </p>
              <p className="text-sm">
                или{" "}
                <span className="text-violet-400 underline underline-offset-4">
                  выберите на компьютере
                </span>
              </p>
              <div className="flex gap-2 mt-6">
                {["PDF", "DOCX", "TXT"].map((fmt) => (
                  <span
                    key={fmt}
                    className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-500"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Таблица истории */}
        {documents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-semibold mb-6 text-gray-300">
              История анализов
            </h2>
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-gray-500 text-sm uppercase tracking-wider">
                  <tr>
                    <th className="p-5 pl-6">Файл</th>
                    <th className="p-5">Дата</th>
                    <th className="p-5">Оценка</th>
                    <th className="p-5 pr-6 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr
                      key={doc.id}
                      className="border-t border-white/5 hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="p-5 pl-6 flex items-center font-medium">
                        <FileText className="w-5 h-5 mr-3 text-violet-400/70" />
                        {doc.filename}
                      </td>
                      <td className="p-5 text-gray-500 text-sm">
                        {new Date(doc.upload_time).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-5">
                        {doc.score ? (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-bold ${getScoreStyles(doc.score)}`}
                          >
                            {doc.score}/100
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </td>
                      <td className="p-5 pr-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/result/${doc.id}`);
                          }}
                          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-400 transition-colors group-hover:text-violet-400"
                        >
                          Открыть
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
