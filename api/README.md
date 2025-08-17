# ThinkBot AI Backend

Backend server for the ThinkBot AI R programming assistant.

## Quick Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Run setup script:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Add your OpenAI API key:**
   Edit the `.env` file and replace `YOUR_API_KEY_HERE` with your actual OpenAI API key.

4. **Start the server:**
   ```bash
   source venv/bin/activate
   uvicorn main_mock:app --reload --port 8000  # Mock server (no API key needed)
   # OR
   uvicorn main:app --reload --port 8000       # Production server (requires API key)
   ```

## Frontend Setup

**Recommended:** Use VS Code Live Server extension
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` in project root → "Open with Live Server"
3. Access at `http://127.0.0.1:5500`

**Alternative:** Run `../setup_frontend.sh` from project root

## API Endpoint

- **URL:** `POST http://127.0.0.1:8000/chat`
- **Body:** `{"question": "Your R question here"}`