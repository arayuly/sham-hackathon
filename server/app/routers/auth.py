from database import get_db
from fastapi import APIRouter, Depends, HTTPException, Response, status

# Предполагается, что у вас есть модель User в models.py
from models import User
from pydantic import BaseModel
from sqlalchemy.orm import Session
from utils.security import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


class UserCreate(BaseModel):
    email: str
    password: str


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    hashed_password = get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Пользователь успешно зарегистрирован"}


@router.post("/login")
def login(response: Response, user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    # Генерируем токен
    access_token = create_access_token(data={"sub": db_user.email})

    # ВАЖНО: Устанавливаем httpOnly cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,  # Защита от XSS
        secure=False,  # Для локальной разработки (на HTTPS сервере должно быть True)
        samesite="lax",  # Защита от CSRF
        max_age=3600,  # Время жизни куки (в секундах)
    )
    return {"message": "Успешный вход"}


@router.post("/logout")
def logout(response: Response):
    # Для выхода просто удаляем куку
    response.delete_cookie("access_token")
    return {"message": "Вы успешно вышли из системы"}
