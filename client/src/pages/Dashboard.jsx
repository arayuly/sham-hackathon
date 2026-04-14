import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Loader2 ,ChevronRight} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";


export default function Dashboard({onFileSelect}) {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate(); 

  // Загрузка истории документов при открытии страницы
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

  // Обработчик Drag-and-Drop
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
        localStorage.setItem('lastId', response.data.document_id);
        // После успешного анализа перенаправляем на страницу результатов
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
   <div className="max-w-6xl mx-auto p-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="mb-10">
        <h1 className="text-[28px] font-black text-slate-800 tracking-tight">
          AI Анализатор ТЗ
        </h1>
        <p className="text-slate-400 text-sm font-medium mt-1">
          Загрузите документ для мгновенной проверки качества и соответствия стандартам.
        </p>
      </div>

      {/* ЗОНА ЗАГРУЗКИ ФАЙЛОВ */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-[32px] p-16 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-[#10B981] bg-emerald-50/50 scale-[0.99]"
            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50/50"
        }`}
      >
        <input {...getInputProps()} />
        
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-[#10B981] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-700 mt-6">ИИ анализирует документ...</p>
            <p className="text-slate-400 text-sm mt-2 font-medium">Это займет около 10-15 секунд</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
              <UploadCloud className="w-10 h-10 text-[#10B981]" />
            </div>
            <p className="text-xl font-bold text-slate-700">
              Перетащите файл ТЗ сюда
            </p>
            <p className="text-slate-400 font-medium mt-2">
              или <span className="text-[#10B981] underline decoration-2 underline-offset-4">выберите файл</span> на компьютере
            </p>
            <div className="flex gap-4 mt-8">
              {['PDF', 'DOCX', 'TXT'].map(type => (
                <span key={type} className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-wider">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ТАБЛИЦА ИСТОРИИ */}
      <div className="mt-16">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-lg font-bold text-slate-800">История загрузок</h2>
          <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">
            {documents.length} Документов
          </span>
        </div>

        <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-wider">Название файла</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-wider">Дата анализа</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-wider">Качество</th>
                <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-wider text-right">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map((doc) => (
                <tr key={doc.id} className="group hover:bg-slate-50/80 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                        <FileText className="w-5 h-5 text-slate-500" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{doc.filename}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-400 font-medium">
                    {new Date(doc.upload_time).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#10B981] rounded-full" 
                          style={{ width: `${doc.score || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-black text-slate-700">
                        {doc.score ? `${doc.score}%` : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      onClick={() => {
                       onFileSelect(doc.id, doc.filename);
                        navigate(`/result/${doc.id}`); 
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-[13px] font-bold rounded-xl hover:bg-[#0F172A] hover:text-white hover:border-[#0F172A] transition-all shadow-sm"
                    >
                      Открыть
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {documents.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-slate-400 font-medium">История пуста. Загрузите первый файл!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
