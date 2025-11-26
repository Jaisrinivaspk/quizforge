from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai_client import generate_mcq_from_text, generate_quiz_from_text 

app = FastAPI()

# Allow local frontend to call backend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # origins allowed
    allow_credentials=True,
    allow_methods=["*"],        # allow all HTTP methods
    allow_headers=["*"],        # allow all headers
)

@app.get("/ping")
def ping():
    return {"status": "ok", "message": "QuizForge backend is running"}

class WaitlistEntry(BaseModel):
    email: str

# Simple in-memory list for now
WAITLIST = []

@app.post("/waitlist")
def add_to_waitlist(entry: WaitlistEntry):
    WAITLIST.append(entry.email)
    print("New waitlist email:", entry.email)
    return {"status": "ok", "message": "Email added to waitlist"}

# --- New MCQ endpoint ---

class MCQRequest(BaseModel):
    text: str

@app.post("/generate-mcq")
def generate_mcq(req: MCQRequest):
    mcq = generate_mcq_from_text(req.text)
    return mcq

class QuizRequest(BaseModel):
    text: str
    num_questions: int = 5  # default

@app.post("/generate-quiz")
def generate_quiz(req: QuizRequest):
    mcqs = generate_quiz_from_text(req.text, req.num_questions)
    return {"questions": mcqs}