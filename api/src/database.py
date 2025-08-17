# backend/src/database.py

import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DATABASE_NAME = "chat_history.sqlite3"

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def init_db():
    """Initializes the database and creates tables if they don't exist."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Create a table for chat sessions
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        timestamp TEXT NOT NULL
    )
    """)
    
    # Create a table for individual messages, linked to a chat session
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        type TEXT NOT NULL, -- 'user' or 'ai'
        text TEXT NOT NULL,
        sources TEXT, -- Store sources as a JSON string
        timestamp TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
    )
    """)
    
    conn.commit()
    conn.close()
    print("Database initialized successfully.")

def get_all_chats() -> List[Dict[str, Any]]:
    """Retrieves all chat sessions (without messages) for the history panel."""
    conn = get_db_connection()
    chats = conn.execute("SELECT id, title, timestamp FROM chats ORDER BY timestamp DESC").fetchall()
    conn.close()
    return [dict(chat) for chat in chats]

def get_messages_for_chat(chat_id: int) -> List[Dict[str, Any]]:
    """Retrieves all messages for a specific chat session."""
    conn = get_db_connection()
    messages = conn.execute("SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC", (chat_id,)).fetchall()
    conn.close()
    
    results = []
    for msg in messages:
        msg_dict = dict(msg)
        # The 'sources' column is stored as a string, so we parse it back into a list
        if msg_dict.get('sources'):
            msg_dict['sources'] = json.loads(msg_dict['sources'])
        results.append(msg_dict)
    return results

def add_message_to_chat(chat_id: Optional[int], message: Dict[str, Any]) -> int:
    """Adds a new message to the database, creating a new chat if necessary."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # If it's the first message of a new chat
    if not chat_id:
        chat_title = message['text'][:50] + ('...' if len(message['text']) > 50 else '')
        cursor.execute("INSERT INTO chats (title, timestamp) VALUES (?, ?)", 
                       (chat_title, datetime.now().isoformat()))
        chat_id = cursor.lastrowid
    
    # Insert the message
    cursor.execute("""
    INSERT INTO messages (chat_id, type, text, sources, timestamp)
    VALUES (?, ?, ?, ?, ?)
    """, (
        chat_id,
        message['type'],
        message['text'],
        json.dumps(message.get('sources', [])), # Convert sources list to JSON string
        message['timestamp']
    ))
    
    conn.commit()
    conn.close()
    return chat_id

def delete_chats(chat_ids: List[int]):
    """Deletes specified chat sessions and their associated messages."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # The '?' placeholder only works for single values, so we create a string of placeholders
    placeholders = ', '.join('?' for _ in chat_ids)
    
    # Delete associated messages first to maintain database integrity
    cursor.execute(f"DELETE FROM messages WHERE chat_id IN ({placeholders})", chat_ids)
    
    # Then delete the chat sessions
    cursor.execute(f"DELETE FROM chats WHERE id IN ({placeholders})", chat_ids)
    
    conn.commit()
    conn.close()
