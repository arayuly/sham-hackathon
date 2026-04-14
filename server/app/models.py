import datetime

from database import Base
from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    documents = relationship("Document", back_populates="owner")
    chats = relationship("ChatHistory", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_format = Column(String)  # Хранение форматов PDF, Word, TXT [cite: 101]
    full_text = Column(Text)
    upload_time = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="documents")
    analysis = relationship("AnalysisResult", back_populates="document", uselist=False)
    chats = relationship("ChatHistory", back_populates="document")


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), unique=True)
    score = Column(Integer)  # Хранение баллов от 0 до 100 [cite: 102]
    errors_found = Column(JSON)  # Размытые формулировки, логические ошибки
    recommendations = Column(JSON)  # Сгенерированные рекомендации
    structure_data = Column(JSON)  # Автоматически построенная структура ТЗ

    document = relationship("Document", back_populates="analysis")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"))
    message = Column(Text)
    is_bot = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="chats")
    document = relationship("Document", back_populates="chats")
