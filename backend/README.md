# Backend for Hybrid AI Chatbot

This is the backend server for the ThinkBot AI, an advanced chatbot designed to be a comprehensive R programming teaching assistant. It acts as the "brain" for the application, processing user questions and generating intelligent responses.

It uses a sophisticated **hybrid architecture** to provide the best and most relevant answer for any type of question, acting like an office with two expert assistants and a smart receptionist:

1.  **The "Private Expert" (RAG System):** An AI that has read and indexed all local course materials and R package documentation. It answers specific questions and provides sources.
2.  **The "Public Generalist" (Standard LLM):** An AI with broad, general knowledge that answers questions not covered in the local material, like debugging user code or explaining general concepts.
3.  **The "Smart Receptionist" (Router):** An intelligent router that analyzes each question and directs it to the appropriate expert.

---

## Setup Instructions

There are two ways to set up the backend: the quick automated way (recommended) or the manual step-by-step way.

### The Quick Way (Recommended)

This method uses a shell script to automate the setup process. It is ideal for macOS and Linux users.

1.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Make the Script Executable:**
    ```bash
    chmod +x setup.sh
    ```

3.  **Run the Setup Script:**
    ```bash
    ./setup.sh
    ```

4.  **Edit the `.env` File:** The script will create a `.env` file for you. You **must** open this file and replace `"YOUR_API_KEY_HERE"` with your actual OpenAI API key.

    ```
    # in .env
    OPENAI_API_KEY="sk-..."
    ```

That's it! The environment is ready. Skip to the [Running the Application](#running-the-application) section.

---

### The Manual Way (Step-by-Step)

Follow these steps if you prefer to set up the environment manually or are on a system that cannot run `.sh` scripts.

#### 1. Prerequisites
Before you begin, ensure you have the following installed:
*   Python 3.8+ and pip
*   Git
*   **System Dependencies:** These are required for document processing.
    *   **On Debian/Ubuntu:**
        ```bash
        sudo apt-get update && sudo apt-get install -y poppler-utils tesseract-ocr
        ```
    *   **On macOS (with Homebrew):**
        ```bash
        brew install poppler tesseract
        ```

#### 2. Clone and Navigate
Clone the main project repository and navigate into the `backend` directory.
```bash
git clone https://github.com/pushpitasaha/thinkbot-AI.git
cd thinkbot-AI/backend
```

#### 3. Create a Virtual Environment
It is highly recommended to use a virtual environment to isolate project dependencies.
```bash
# Create the environment
python3 -m venv venv

# Activate the environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate
```

#### 4. Install Python Dependencies
Install all required packages from the `requirements.txt` file.
```bash
pip install -r requirements.txt
```

#### 5. Configure Environment Variables (.env)
This is a critical step for providing the necessary API keys and settings to the application.

1.  Create a file named `.env` in the `backend/` directory.
2.  Open the `.env` file and add the following content:

    ```env
    # Replace with your actual OpenAI secret key
    OPENAI_API_KEY="YOUR_API_KEY_HERE"

    # A comma-separated list of URLs where the frontend is running
    FRONTEND_URLS=http://localhost:9000,http://127.0.0.1:9000,http://0.0.0.0:9000
    ```
*   **`OPENAI_API_KEY`**: This is required for the production server to connect to OpenAI's models.
*   **`FRONTEND_URLS`**: This is required for the browser's CORS security policy, allowing the frontend to communicate with the backend.

---

## Running the Application

Once setup is complete, you can run either the production server or the mock server.

### Running the Production Server (Real AI)
This server connects to OpenAI and provides real, intelligent answers. It requires a valid `OPENAI_API_KEY` in your `.env` file.

```bash
# Make sure your virtual environment is active: source venv/bin/activate
uvicorn main:app --reload --port 8000
```
The first time you run this, it will take a minute to build the knowledge bases.

### Running the Mock Server (For Frontend Testing)
This server runs locally without needing an API key. It uses pre-canned, realistic responses, which is perfect for testing the frontend UI without incurring API costs.

```bash
# Make sure your virtual environment is active: source venv/bin/activate
uvicorn main_mock:app --reload --port 8000```

---

## API Endpoint

The main endpoint to interact with the chatbot is `POST /chat`.

*   **URL:** `http://127.0.0.1:8000/chat`
*   **Method:** `POST`
*   **Body (Example):**
    ```json
    {
      "question": "What operator should I use to assign a value?"
    }
    ```
*   **Success Response (Example):**
    ```json
    {
      "answer": "In R, the standard convention taught in the course for assigning a value to a variable is to use the arrow operator...",
      "sources": [
        {
          "source_module": "Module 1: Getting Started with R",
          "timestamp": "12:38"
        }
      ],
      "suggested_prompts": [
        "1. What other data types can I assign?",
        "2. How do I create a vector?",
        "3. How do I view the value of a variable?"
      ]
    }
    ```

---

## Project Structure

```
backend/
├── knowledge_base/         # Contains local documents (JSON, PDF) for the AI
│   ├── course_modules/
│   └── r_packages/
├── src/                    # Main application source code
│   ├── chains.py
│   ├── config.py
│   ├── data_loader.py
│   └── mock_components.py
├── vector_stores/          # Indexed knowledge bases (auto-generated)
├── .env                    # Local environment variables (YOU MUST CREATE THIS)
├── main.py                 # FastAPI app for PRODUCTION server
├── main_mock.py            # FastAPI app for MOCK server
├── requirements.txt        # Python package dependencies
├── setup.sh                # Automated setup script
└── README.md               # This file
```