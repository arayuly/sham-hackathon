import models
from database import Base, engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import documents

# Создание таблиц в БД
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SHAM-SpecAnalyzer API",
    description="API для анализа технических заданий научных проектов",
    version="1.0.0",
)

# CORS for React dev server (Vite defaults to port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
