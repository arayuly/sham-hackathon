import json
import os

from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))


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





async def check_grant_compliance(text: str, grant_name: str) -> dict:
    """
    Анализирует текст ТЗ на соответствие специфическим требованиям выбранного гранта.
    """
    prompt = f"""
    Проанализируй техническое задание (ТЗ) на соответствие типовым требованиям гранта: "{grant_name}".
    Проверь наличие следующих обязательных для научных грантов разделов:
    1. Цели и задачи проекта.
    2. Обоснование научной новизны или практической значимости.
    3. Календарный план / этапы реализации.
    4. Ожидаемые результаты (публикации, патенты, макеты) и показатели KPI.
    5. Требования к оборудованию или бюджету.

    Текст ТЗ:
    {text}

    Верни ответ СТРОГО в формате JSON с ключами:
    - "compliance_score" (число от 0 до 100 - процент готовности к подаче),
    - "present_sections" (массив строк - что хорошо описано),
    - "missing_sections" (массив строк - чего критически не хватает для гранта),
    - "expert_advice" (одна строка - главный совет по доработке для комиссии).
    """

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def compare_with_template(text: str) -> dict:
    """
    Сравнивает загруженный документ с эталонным шаблоном ТЗ.
    """
    # Зашиваем структуру из "Шаблон для ТЗ рус.docx" в качестве эталона
    standard_structure = """
    1. Общие сведения (Наименование приоритета, направления).
    2. Цели и задачи программы.
    3. Какие пункты стратегических и программных документов решает.
    4. Ожидаемые результаты (Прямые результаты, Конечный результат, Экономический, Экологический, Социальный эффект, Целевые потребители).
    5. Предельная сумма программы по годам.
    """

    prompt = f"""
    Сравни предоставленный текст технического задания с эталонной структурой.

    Эталонная структура ТЗ:
    {standard_structure}

    Текст загруженного ТЗ:
    {text}

    Верни ответ СТРОГО в формате JSON с ключами:
    - "match_percentage" (число от 0 до 100 - процент совпадения структуры),
    - "missing_sections" (массив строк - какие разделы из эталона полностью отсутствуют),
    - "extra_sections" (массив строк - какие разделы есть в тексте, но они лишние или не соответствуют эталону),
    - "conclusion" (одна строка - краткий вывод о соответствии).
    """

    response = await client.chat.completions.create(
        model=MODEL,  # Llama 3 (Groq)
        messages=[
            {
                "role": "system",
                "content": "Ты строгий нормоконтролер технической документации.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)


async def extract_metrics(text: str) -> dict:
    """
    Извлекает сроки, бюджеты и показатели KPI из текста ТЗ.
    """
    prompt = f"""
    Проанализируй текст технического задания и извлеки из него все конкретные метрики, сроки и финансовые показатели.
    Игнорируй общий текст, нужны только сухие факты и цифры.

    Текст:
    {text}

    Верни ответ СТРОГО в формате JSON с ключами:
    - "deadlines" (массив строк: конкретные даты, годы или периоды, например "2026-2028 гг", "15 апреля 2025"),
    - "kpis" (массив строк: измеримые показатели, проценты, количество, например "рост энергоэффективности на 40%", "не менее 6 статей"),
    - "budget" (массив строк: суммы, финансовые ограничения, например "1 500 000 тыс. тенге")
    """

    response = await client.chat.completions.create(
        model=MODEL,  # Llama 3 (Groq)
        messages=[
            {
                "role": "system",
                "content": "Ты точный анализатор данных. Извлекаешь только числа, даты и метрики.",
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"},
    )
    return json.loads(response.choices[0].message.content)








async def analyze_full_document(text: str):
    # Промпт настроен так, чтобы ИИ сопоставил ошибки с твоими критериями
    prompt = f"""
    Проанализируй текст научного ТЗ. Найди все слабые места, размытые формулировки и логические ошибки.
    
    ДЛЯ КАЖДОЙ ОШИБКИ:
        1. "phrase": СТРОГО идентичная цитата из текста (символ в символ, без смены падежа).
        2. "replacement": конкретное SMART-исправление с цифрами/сроками.
        3. "category": строго из списка: [Measurability, Precision, Evidence, Accountability, Time-bound].
        4. "criterion": строго из списка ID: [goals_tasks, scientific_novelty, practical_applicability, expected_results, socio_economic_effect, feasibility, strategic_relevance].

    Количественный лимит: Итоговый список found_issues должен содержать не менее 10 объектов. Если текст короткий, ищи мельчайшие неточности, но выполни норму.

    Текст ТЗ:
    {text}

    Верни ответ СТРОГО в формате JSON:
    {{
      "found_issues": [
        {{
          "phrase": "фраза",
          "replacement": "замена",
          "category": "категория",
          "criterion": "ID_критерия"
        }}
      ],
      "scores": {{ "goals_tasks": 8, "scientific_novelty": 5, ... }},
      "explanations": {{ "goals_tasks": "почему такой балл", ... }}
    }}
    """

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "Ты эксперт по научным ТЗ. Твоя задача — находить ошибки и предлагать исправления, привязывая их к критериям оценки."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
