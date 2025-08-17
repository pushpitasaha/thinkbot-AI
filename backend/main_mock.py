# main_mock.py
import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# --- 1. Load Environment and Mock Blueprints ---
load_dotenv()
from src.mock_components import get_mock_llm, get_mock_embeddings
from src.data_loader import get_retrievers
from src.chains import create_master_chain

# --- 2. Assemble the MOCK Application ---
print("="*50)
print("ASSEMBLING MOCK APPLICATION")
print("="*50)
llm = get_mock_llm()
embeddings = get_mock_embeddings()
retrievers = get_retrievers(embeddings, is_mock=True)
master_chain, suggestion_chain = create_master_chain(llm, retrievers)

# --- 3. FastAPI Application ---
app = FastAPI(title="Hybrid R Chatbot - Mock Version")

# Temporary CORS fix - allow all origins for debugging
print("CORS DEBUG MODE: Allowing all origins")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str

@app.options("/chat")
def chat_options():
    return {"message": "OK"}

@app.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    result = master_chain.invoke({"input": request.question})
    final_answer, sources = "", []

    if isinstance(result, dict) and "answer" in result:
        final_answer = result.get("answer", "Could not find a mock answer.")
        # We manually add mock sources for testing the frontend display
        if "course material" in final_answer:
            sources = [
                {"source_module": "Module 1: Getting Started with R", "timestamp": "07:35"},
                {"source_module": "Module 1: Getting Started with R", "timestamp": "12:38"}
            ]
        elif "R package manual" in final_answer:
             sources = [
                {"source_module": "dplyr PDF Manual", "timestamp": "N/A"}
            ]
    else:
        final_answer = result.content if hasattr(result, 'content') else str(result)
    
    try:
        suggestions_result = suggestion_chain.invoke({"input": request.question, "answer": final_answer})
        suggestions_text = suggestions_result.content.strip()
        suggested_prompts = [line.strip() for line in suggestions_text.splitlines() if line.strip()]
    except Exception as e:
        print(f"Error generating mock suggestions: {e}")
        suggested_prompts = []

    return {
        "answer": final_answer,
        "sources": sources,
        "suggested_prompts": suggested_prompts
    }