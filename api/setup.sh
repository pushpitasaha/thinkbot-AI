#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Helper Functions for Colored Output ---
info() {
    echo -e "\033[34m[INFO]\033[0m $1"
}

success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

# --- 1. System Dependencies ---
info "This script will set up the Python environment for the ThinkBot AI backend."
info "Please ensure you have Python 3.8+ and pip installed."
warning "You may need to install system dependencies first. For Debian/Ubuntu, run:"
warning "sudo apt-get update && sudo apt-get install -y poppler-utils tesseract-ocr"
warning "For macOS (with Homebrew), run: brew install poppler tesseract"
echo "------------------------------------------------------------------"

# --- 2. Create Python Virtual Environment ---
info "Creating Python virtual environment in 'venv'..."
python3 -m venv venv
success "Virtual environment created."

# --- 3. Activate Virtual Environment and Install Dependencies ---
info "Activating virtual environment..."
source venv/bin/activate
info "Installing Python packages from requirements.txt..."
pip install -r requirements.txt
success "All Python packages installed successfully."

# --- 4. Create and Configure .env File ---
info "Checking for .env file..."
if [ -f ".env" ]; then
    success ".env file already exists. Skipping creation."
else
    info "Creating .env file from template..."
    echo 'OPENAI_API_KEY="YOUR_API_KEY_HERE"' > .env
    echo 'FRONTEND_URLS=http://localhost:9000,http://127.0.0.1:9000,http://0.0.0.0:9000,http://localhost:5500,http://127.0.0.1:5500' >> .env
    success "Created .env file."
    warning "IMPORTANT: You MUST edit the .env file and replace 'YOUR_API_KEY_HERE' with your actual OpenAI API key."
fi

echo "------------------------------------------------------------------"
success "Backend setup is complete!"
info "Next steps:"
info "1. (IMPORTANT) Edit the .env file with your OpenAI API key."
info "2. Activate the virtual environment by running: source venv/bin/activate"
info "3. Run the mock server with: uvicorn main_mock:app --reload --port 8000"
info "   OR run the production server with: uvicorn main:app --reload --port 8000"
echo ""
warning "FRONTEND SETUP:"
info "For the best development experience, use VS Code's Live Server extension:"
info "1. Install 'Live Server' extension by Ritwick Dey in VS Code"
info "2. Right-click on index.html in the project root and select 'Open with Live Server'"
info "3. This will serve the frontend on port 5500 (already configured in CORS)"
info "4. Alternative: Run '../setup_frontend.sh' for other frontend serving options"