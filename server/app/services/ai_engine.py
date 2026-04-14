import json
import os

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()
# Вставьте ваш API ключ или настройте через переменные окружения
client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

# Используем одну из самых быстрых моделей
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"


async def analyze_tz_content(text: str) -> dict:
    """
    Промпт 1: Выявление ошибок и неточностей[cite: 106, 139].
    """
    prompt = f"""
    Проанализируй следующее техническое задание (ТЗ) на научный проект.
    Тебе необходимо выявить:
    1. Размытые формулировки.
    2. Отсутствующие требования.
    3. Внутренние несоответствия и логические ошибки.
    4. Отсутствующие показатели KPI и ожидаемые результаты.

    Текст ТЗ:
    {text}

    Верни ответ СТРОГО в формате JSON с ключами: "fuzzy_wordings", "missing_requirements", "logical_errors", "missing_kpis".
    Значения должны быть массивами строк.
    """

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Ты эксперт по оценке научных технических заданий. Отвечай только в формате JSON.",
            },
            {"role": "user", "content": prompt},
        ],
        # Groq также поддерживает JSON mode для Llama 3
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def score_tz(text: str) -> int:
    """
    Промпт 2: Оценка качества ТЗ по шкале от 0 до 100 баллов[cite: 107, 139].
    """
    prompt = f"""
    Оцени качество предоставленного ТЗ по шкале от 0 до 100.
    Текст: {text}

    Верни СТРОГО JSON вида {{"score": 85}}. Ничего кроме JSON.
    """

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    result = json.loads(response.choices[0].message.content)
    return result.get("score", 0)


async def generate_improvements(text: str) -> dict:
    """
    Промпт 3: Генерация рекомендаций и структуры ТЗ[cite: 108, 139].
    """
    prompt = f"""
    На основе следующего ТЗ сгенерируй:
    1. Рекомендации по улучшению.
    2. Рекомендуемую структуру ТЗ.

    Текст: {text}

    Верни ответ СТРОГО в формате JSON с ключами: "recommendations" (массив строк), "recommended_structure" (массив строк).
    """

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def chat_with_assistant(
    user_message: str, tz_structure: str, recommendations: str
) -> str:
    """
    Отвечает на вопросы пользователя по конкретному ТЗ, опираясь на его анализ.
    """
    prompt = f"""
    Ты AI-помощник по улучшению технических заданий. Пользователь задает вопрос по своему ТЗ.

    Краткая выжимка из нашего анализа этого ТЗ:
    Рекомендации: {recommendations}
    Рекомендуемая структура: {tz_structure}

    Вопрос пользователя: "{user_message}"

    Ответь кратко, профессионально и по делу. Не используй JSON, отвечай обычным текстом.
    """

    response = await client.chat.completions.create(
        model=MODEL,  # llama3-8b-8192
        messages=[{"role": "user", "content": prompt}],
        # Здесь response_format не нужен, так как ждем обычный текст для чата
    )
    return response.choices[0].message.content
