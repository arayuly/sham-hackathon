Вот структура README.md для всего репозитория, объединяющая фронтенд и бэкенд в единую экосистему. Она оформлена так, чтобы любой разработчик (или твой дипломный руководитель) смог развернуть проект за пару минут.
🛡️ SHAM AI: Система интеллектуального аудита НТЗ

SHAM AI — это полностек-приложение для автоматизированного анализа научно-технических заданий. Система выявляет слабые места в тексте по методологии SMART и оценивает проект по 7 ключевым критериям.
🏗️ Архитектура системы

    Frontend: React, Tailwind CSS, Recharts (Radar Chart), Lucide Icons.

    Backend: FastAPI, Python, SQLAlchemy.

    AI Engine: RAG (Retrieval-Augmented Generation) на базе FAISS и BGE-M3 эмбеддингов.

🚀 Быстрый старт (Development)
1. Клонирование репозитория
Bash

git clone https://github.com/your-username/sham-ai.git
cd sham-ai

2. Запуск Backend (FastAPI)

Бэкенд отвечает за обработку текста и взаимодействие с LLM.
Bash

cd backend
python -m venv venv
source venv/bin/activate  # Fedora/Linux
pip install -r requirements.txt

# Запуск в режиме разработки
fastapi dev main.py

API будет доступно на: http://localhost:8000
3. Запуск Frontend (React)

Фронтенд предоставляет интерфейс с подсветкой текста и визуализацией баллов.
Bash

cd ../frontend
npm install

# Запуск приложения
npm run dev

Интерфейс будет доступен на: http://localhost:5173
📂 Структура проекта
Plaintext

SHAM-AI/
├── backend/                # FastAPI приложение
│   ├── app/
│   │   ├── services/       # Логика AI аудита и FAISS
│   │   ├── api/            # Эндпоинты (анализ, история)
│   │   └── models/         # БД модели (PostgreSQL)
│   └── main.py             # Точка входа
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/     # RadarChart, IssueHighlight и др.
│   │   ├── hooks/          # useMemo логика для подсветки
│   │   └── App.jsx         # Основной дашборд
└── docs/                   # Схемы UML и DFD (дипломная документация)

🛠️ Основные возможности

    Smart Highlighting: Автоматическая подсветка «размытых» зон прямо в тексте.

    Radar Analytics: Визуализация оценки проекта по 10-балльной шкале.

    AI Recommendations: Генерация конкретных SMART-замен для каждой найденной ошибки.

    Dark/Light Mode: Адаптивный дизайн для комфортной работы.

📝 Переменные окружения (.env)

Для корректной работы создайте .env в папке backend:
Code snippet

DATABASE_URL=postgresql://user:pass@localhost/sham_db
LLM_API_KEY=ваш_ключ

Проект разработан студентом Satbayev University.
