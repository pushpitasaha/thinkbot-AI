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

error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# --- 1. Welcome Message ---
info "This script will set up the ThinkBot AI frontend application."
info "The frontend is a static web application built with vanilla JavaScript, HTML5, and CSS3."
echo "------------------------------------------------------------------"

# --- 2. Check Dependencies ---
info "Checking system dependencies..."

# Check if Python3 is available (for serving static files)
if ! command -v python3 &> /dev/null; then
    error "Python3 is not installed. Please install Python3 to serve the static files."
    echo "For Debian/Ubuntu: sudo apt-get install python3"
    echo "For CentOS/RHEL: sudo yum install python3"
    exit 1
fi

success "Python3 is available for serving static files."

# Check if we have a modern browser available (optional check)
if command -v google-chrome &> /dev/null || command -v chromium-browser &> /dev/null || command -v firefox &> /dev/null; then
    success "Web browser detected for testing."
else
    warning "No common web browser detected. You'll need a modern browser to run the application."
fi

echo "------------------------------------------------------------------"

# --- 3. Verify Frontend Files ---
info "Verifying frontend files..."

required_files=("index.html" "script.js" "styles.css" "config.js" "think-neuro-logo.png")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    success "All required frontend files are present."
else
    error "Missing required files: ${missing_files[*]}"
    exit 1
fi

echo "------------------------------------------------------------------"

# --- 4. Configure API Connection ---
info "Configuring API connection..."

# Check if config.js exists and contains the API_BASE_URL
if grep -q "API_BASE_URL" config.js; then
    current_url=$(grep "API_BASE_URL" config.js | sed "s/.*'\(.*\)'.*/\1/")
    success "Current API URL: $current_url"
    
    echo ""
    info "The frontend is configured to connect to: $current_url"
    info "Common configurations:"
    info "  - Local Mock Server: http://127.0.0.1:8000 (for development/testing)"
    info "  - Local Real Server: http://127.0.0.1:8000 (with OpenAI API)"
    info "  - Production Server: https://your-domain.com"
    echo ""
    
    read -p "Do you want to change the API URL? (y/N): " change_url
    if [[ $change_url =~ ^[Yy]$ ]]; then
        echo ""
        info "Enter the new API URL (e.g., http://127.0.0.1:8000):"
        read -p "API URL: " new_url
        
        if [ ! -z "$new_url" ]; then
            # Backup the original config
            cp config.js config.js.backup
            
            # Update the API_BASE_URL in config.js
            sed -i "s|const API_BASE_URL = '.*';|const API_BASE_URL = '$new_url';|" config.js
            success "API URL updated to: $new_url"
            info "Backup saved as config.js.backup"
        else
            warning "No URL provided. Keeping current configuration."
        fi
    fi
else
    warning "API_BASE_URL not found in config.js. Please check the configuration manually."
fi

echo "------------------------------------------------------------------"

# --- 5. Setup Complete ---
success "Frontend setup is complete!"
echo ""
info "To run the frontend application:"
echo ""
info "Option 1: Simple Python HTTP Server (Recommended)"
info "  python3 -m http.server 9000"
info "  Then open: http://localhost:9000"
echo ""
info "Option 2: Using Python with specific binding"
info "  python3 -m http.server 9000 --bind 127.0.0.1"
info "  Then open: http://127.0.0.1:9000"
echo ""
info "Option 3: If you have Node.js installed"
info "  npx serve . -p 9000"
info "  Then open: http://localhost:9000"
echo ""
warning "IMPORTANT NOTES:"
warning "1. Make sure the backend server is running before using the chat features"
warning "2. The frontend runs on port 9000 by default (you can change this)"
warning "3. Ensure CORS is properly configured in the backend for your frontend URL"
echo ""
info "Backend setup: Run './backend/setup.sh' from the project root"
info "Backend start: 'cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000'"

echo "------------------------------------------------------------------"

# --- 6. Optional: Start the server ---
echo ""
read -p "Do you want to start the frontend server now? (y/N): " start_server
if [[ $start_server =~ ^[Yy]$ ]]; then
    info "Starting frontend server on port 9000..."
    info "Press Ctrl+C to stop the server"
    info "Open your browser to: http://localhost:9000"
    echo ""
    python3 -m http.server 9000
fi

echo ""
success "Frontend setup script completed successfully!"
