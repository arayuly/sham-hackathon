from datetime import datetime, timedelta

import jwt
from passlib.context import CryptContext

# Секретный ключ (для хакатона можно оставить так, в проде вынести в .env)
SECRET_KEY = "sham_super_secret_key_for_hackathon"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    safe_password = password[:72]
    if len(safe_password) < 8:
        raise ValueError("Пароль должен содержать минимум 8 символов")
    return pwd_context.hash(safe_password)


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
