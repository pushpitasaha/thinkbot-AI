# main.py
import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from datetime import datetime
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# --- NEW: Import database functions ---
from src import database

# --- 1. Load Environment and Blueprints ---
load_dotenv()
from src.config import get_production_llm, get_production_embeddings
from src.data_loader import get_retrievers
from src.chains import create_master_chain

# --- 2. Assemble the Application ---
print("="*50)
print("ASSEMBLING PRODUCTION APPLICATION")
print("="*50)
# Create the real AI components
llm = get_production_llm()
embeddings = get_production_embeddings()
# Inject them to build the retrievers and chains
retrievers = get_retrievers(embeddings, is_mock=False)
master_chain, suggestion_chain = create_master_chain(llm, retrievers)

# --- 3. FastAPI Application ---
app = FastAPI(title="Hybrid R Chatbot - Production Version")

# --- NEW: Initialize database on startup ---
@app.on_event("startup")
def startup_event():
    database.init_db()

# Temporary CORS fix - allow all origins for debugging
print("CORS DEBUG MODE: Allowing all origins")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all origins
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- MODIFIED: Update ChatRequest to include optional chat_id ---
class ChatRequest(BaseModel):
    question: str
    chat_id: Optional[int] = None

# --- NEW: Pydantic model for deleting chats ---
class DeleteRequest(BaseModel):
    ids: List[int]

@app.options("/chat")
def chat_options():
    return {"message": "OK"}

# --- MODIFIED: The /chat endpoint now saves messages ---
@app.post("/chat")
def chat(request: ChatRequest) -> Dict[str, Any]:
    try:
        # 1. Save user's message to the database
        user_message = {
            "type": "user",
            "text": request.question,
            "timestamp": datetime.now().isoformat()
        }
        # This will return a new ID if chat_id is None, or the existing ID back
        chat_id = database.add_message_to_chat(request.chat_id, user_message)

        # 2. Get AI response (this logic remains the same)
        print(f"DEBUG: Processing question: {request.question}")
        result = master_chain.invoke({"input": request.question})
        print(f"DEBUG: Chain result type: {type(result)}")
        print(f"DEBUG: Chain result: {result}")
        
        final_answer, sources = "", []
        if isinstance(result, dict) and "answer" in result:
            final_answer = result.get("answer", "Could not find a specific answer.")
            if "context" in result: 
                sources = [doc.metadata for doc in result["context"]]
                print(f"DEBUG: Found {len(sources)} sources")
        else:
            final_answer = result.content if hasattr(result, "content") else str(result)
            print(f"DEBUG: Using content/string result")
        
        # 3. Get suggested prompts (this logic remains the same)
        try:
            suggestions_result = suggestion_chain.invoke({"input": request.question, "answer": final_answer})
            suggestions_text = suggestions_result.content.strip()
            suggested_prompts = [line.strip() for line in suggestions_text.splitlines() if line.strip()]
        except Exception as e:
            print(f"Error generating suggestions: {e}")
            suggested_prompts = []

        # 4. Save AI's message to the database
        ai_message = {
            "type": "ai",
            "text": final_answer,
            "sources": sources,
            "timestamp": datetime.now().isoformat()
        }
        database.add_message_to_chat(chat_id, ai_message)

        # 5. Return the response to the frontend, now including the chat_id
        return {
            "answer": final_answer,
            "sources": sources,
            "suggested_prompts": suggested_prompts,
            "chat_id": chat_id
        }
    except Exception as e:
        print(f"ERROR in /chat endpoint: {e}")
        import traceback
        traceback.print_exc()
        
        # Return a proper JSON response instead of raising an HTTPException
        # This ensures the frontend gets the expected JSON structure
        return {
            "error": str(e), 
            "answer": "Sorry, an error occurred processing your request."
        }

# --- NEW: Endpoint to get all chat history ---
@app.get("/history")
def get_history():
    try:
        result = database.get_all_chats()
        print(f"DEBUG: Retrieved {len(result)} chats from database")
        return result
    except Exception as e:
        print(f"ERROR in /history endpoint: {e}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

# --- NEW: Endpoint to get messages for a specific chat ---
@app.get("/chats/{chat_id}")
def get_chat_messages(chat_id: int):
    return database.get_messages_for_chat(chat_id)

# --- NEW: Endpoint to delete selected chats ---
@app.post("/history/delete")
async def delete_history(request: DeleteRequest):
    database.delete_chats(request.ids)
    return {"status": "success"}