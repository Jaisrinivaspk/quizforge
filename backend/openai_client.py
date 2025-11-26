# openai_client.py

import os
import json
from dotenv import load_dotenv
from openai import OpenAI

from utils_text import split_text_into_chunks

# Load API key
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise RuntimeError("OPENAI_API_KEY not set in .env")

client = OpenAI(api_key=api_key)

# ---------- Single MCQ prompt ----------

SINGLE_PROMPT_TEMPLATE = """
You are an expert educator. Generate ONE multiple-choice question (MCQ) from the passage below.

Return JSON ONLY in this format:
{
  "question": "...",
  "options": ["A...", "B...", "C...", "D..."],
  "answer": "A",
  "explanation": "...",
  "difficulty": "easy|medium|hard"
}

Rules:
- Exactly 4 options.
- Only ONE correct answer.
- Distractors must be plausible but clearly incorrect.
- Question ≤ 40 words, each option ≤ 12 words.

Passage:
<<<{TEXT}>>>
"""

# ---------- Multi-MCQ prompt ----------

MULTI_PROMPT_TEMPLATE = """
You are an expert educator. Generate {N} multiple-choice questions (MCQs) from the passage below.

Return a JSON ARRAY ONLY, like:
[
  {
    "question": "...",
    "options": ["A...", "B...", "C...", "D..."],
    "answer": "A",
    "explanation": "...",
    "difficulty": "easy|medium|hard"
  }
]

Rules:
- Exactly 4 options per question.
- Only ONE correct answer per question.
- Distractors must be plausible but clearly incorrect.
- Each question should test a DIFFERENT concept.
- Question ≤ 40 words, each option ≤ 12 words.

Passage:
<<<{TEXT}>>>
"""


def generate_mcq_from_text(text: str):
    """
    Generate ONE MCQ from a short passage.
    Used by /generate-mcq endpoint.
    """
    text = text.strip()
    if not text:
        raise ValueError("Empty text passed to generate_mcq_from_text")

    prompt = SINGLE_PROMPT_TEMPLATE.replace("{TEXT}", text)

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # adjust to your available model
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )

    content = response.choices[0].message.content

    try:
        mcq = json.loads(content)
    except json.JSONDecodeError:
        # Here you could try to clean ```json fences etc., but for now just raise
        raise ValueError("Model did not return valid JSON: " + content)

    return mcq


def generate_quiz_from_text(text: str, n_questions: int = 5):
    """
    Generate up to n_questions MCQs from a longer text.
    Uses simple chunking to avoid overloading the model.
    """
    text = text.strip()
    if not text:
        return []

    if n_questions <= 0:
        return []

    # Split text into manageable chunks with overlap
    chunks = split_text_into_chunks(text, max_chars=1200, overlap=200)

    all_mcqs = []
    questions_needed = n_questions

    for chunk in chunks:
        if questions_needed <= 0:
            break

        # Ask for a small batch per chunk
        ask_n = min(questions_needed, 3)

        prompt = MULTI_PROMPT_TEMPLATE.replace("{TEXT}", chunk).replace("{N}", str(ask_n))

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # adjust model name as needed
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )

        content = response.choices[0].message.content

        # Optional: handle fenced code blocks like ```json ... ```
        cleaned = content.strip()
        if cleaned.startswith("```"):
            # Remove leading and trailing ``` or ```json fences
            cleaned = cleaned.strip("`")
            # (We can get fancier later if needed)
        
        try:
            mcqs = json.loads(cleaned)
        except json.JSONDecodeError:
            print("❌ Failed to parse JSON for a chunk. Raw content was:")
            print(content)
            continue

        # Ensure it's a list
        if isinstance(mcqs, dict):
            mcqs = [mcqs]

        all_mcqs.extend(mcqs)
        questions_needed = n_questions - len(all_mcqs)

    # Return at most n_questions
    return all_mcqs[:n_questions]


