import os
from dotenv import load_dotenv
from openai import OpenAI
import json

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
  raise RuntimeError("OPENAI_API_KEY not set in .env")

client = OpenAI(api_key=api_key)

PROMPT_TEMPLATE = """
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

def generate_mcq_from_text(text: str):
    prompt = PROMPT_TEMPLATE.replace("{TEXT}", text)

    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or another model from your account
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )

    content = response.choices[0].message.content
    print("Raw model response:\n", content)

    try:
        mcq = json.loads(content)
    except json.JSONDecodeError:
        print("❌ Failed to parse JSON. Check the prompt or model output.")
        raise

    return mcq

if __name__ == "__main__":
    sample_text = """
    Photosynthesis is the process by which green plants and some other organisms
    use sunlight to synthesize foods from carbon dioxide and water. 
    Photosynthesis in plants generally involves the green pigment chlorophyll 
    and generates oxygen as a byproduct.
    """

    mcq = generate_mcq_from_text(sample_text)
    print("\nParsed MCQ object:")
    print(json.dumps(mcq, indent=2))
