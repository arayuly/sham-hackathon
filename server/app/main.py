import traceback

import models
from database import Base, engine
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import auth, documents
from starlette.exceptions import HTTPException as StarletteHTTPException

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


# Глобальный обработчик Pydantic ошибок
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    return JSONResponse(
        status_code=422,
        content={
            "detail": exc.errors()[0]["msg"]
            if exc.errors()
            else "Validation error"  # Только текст ошибки
        },
    )


# Глобальный обработчик HTTPException
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


app.include_router(documents.router)
app.include_router(auth.router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
