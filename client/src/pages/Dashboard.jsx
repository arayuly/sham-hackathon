import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
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
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        AI Анализатор ТЗ
      </h1>

      {/* Зона загрузки файлов */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-primary bg-blue-50"
            : "border-gray-300 bg-white hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center text-primary">
            <Loader2 className="w-12 h-12 mb-4 animate-spin" />
            <p className="text-lg font-medium">ИИ анализирует документ...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />
            <p className="text-lg">
              Перетащите файл ТЗ сюда или кликните для выбора
            </p>
            <p className="text-sm mt-2">Поддерживаются: PDF, DOCX, TXT</p>
          </div>
        )}
      </div>

      {/* Таблица истории */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">История загрузок</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="p-4">Файл</th>
                <th className="p-4">Дата загрузки</th>
                <th className="p-4">Оценка качества</th>
                <th className="p-4">Действие</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-t">
                  <td className="p-4 flex items-center">
                    <FileText className="w-5 h-5 mr-3 text-blue-500" />
                    {doc.filename}
                  </td>
                  <td className="p-4">
                    {new Date(doc.upload_time).toLocaleString()}
                  </td>
                  <td className="p-4 font-bold text-primary">
                    {doc.score ? `${doc.score}/100` : "—"}
                  </td>
                  <td className="p-4">
                   <button
                    onClick={() => {
                     
                      localStorage.setItem('lastId', doc.id);
                      
                      
                      navigate(`/result/${doc.id}`); 
                    }}
                    className="text-[#10B981] font-bold hover:underline transition-all"
                  >
                    Смотреть анализ
                  </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
