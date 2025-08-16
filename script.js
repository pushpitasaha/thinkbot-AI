// ThinkBot AI - Main JavaScript File

class ThinkBotAI {
    constructor() {
        // --- MODIFIED: State is now simpler ---
        this.currentChat = null; // Will hold {id, title, messages}
        this.chatHistory = [];   // Will hold {id, title, timestamp} from server
        this.attachments = [];
        this.mediaRecorder = null;
        this.recordingChunks = [];
        this.isRecording = false;
        this.recordingTimer = null;
        this.recordingStartTime = null;
        this.selectedHistoryItems = new Set();
        
        this.initializeElements();
        this.bindEvents();
        // --- NEW: Asynchronously load history from backend ---
        this.initializeChat(); 
        this.initializeWelcomeAnimations();
        this.initializeSplitTextAnimations();
    }

    // --- NEW METHOD ---
    async initializeChat() {
        await this.fetchHistory();
        if (this.chatHistory && this.chatHistory.length > 0) {
            // Load the most recent chat by default
            this.loadChat(this.chatHistory[0].id);
        } else {
            this.showWelcomeMessage();
        }
    }

    initializeElements() {
        // Navigation elements
        this.navItems = document.querySelectorAll('.nav-item');
        this.tabContents = document.querySelectorAll('.tab-content');
        
        // Chat elements
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-message');
        this.welcomeContainer = document.getElementById('welcome-container');
        
        // Welcome elements
        this.welcomeMessageInput = document.getElementById('welcome-message-input');
        this.welcomeSendButton = document.getElementById('welcome-send-message');
        this.welcomeCards = document.querySelectorAll('.welcome-card');
        
        // Action buttons
        this.attachFileBtn = document.getElementById('attach-file');
        this.attachImageBtn = document.getElementById('attach-image');
        this.recordAudioBtn = document.getElementById('record-audio');
        this.fileInput = document.getElementById('file-input');
        this.imageInput = document.getElementById('image-input');
        
        // History elements
        this.historyList = document.getElementById('history-list');
        this.refreshHistoryBtn = document.getElementById('refresh-history');
        this.selectAllHistoryBtn = document.getElementById('select-all-history');
        this.clearSelectedHistoryBtn = document.getElementById('clear-selected-history');
        
        // Search elements
        this.searchInput = document.getElementById('search-input');
        this.searchBtn = document.getElementById('search-btn');
        this.searchResults = document.getElementById('search-results');
        
        // Audio recording elements
        this.audioModal = document.getElementById('audio-modal');
        this.recordBtn = document.getElementById('record-btn');
        this.recorderStatus = document.getElementById('recorder-status');
        this.recordingTime = document.getElementById('recording-time');
        this.closeAudioModal = document.getElementById('close-audio-modal');
        
        // Module elements
        this.moduleCards = document.querySelectorAll('.module-card');
        this.modulesTitle = document.getElementById('modules-title');
        
        // New Chat elements
        this.newChatBtn = document.getElementById('new-chat-btn');
    }

    bindEvents() {
        // Navigation events
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = item.dataset.tab;
                const module = item.dataset.module;
                
                if (tab) {
                    this.switchTab(tab);
                } else if (module) {
                    this.handleModuleClick(module);
                }
            });
        });

        // Chat events
        this.sendButton.addEventListener('click', () => this.sendMessage(false));
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(false);
            }
        });

        // Welcome input events
        this.welcomeSendButton.addEventListener('click', () => this.sendMessage(true));
        this.welcomeMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage(true);
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });

        this.welcomeMessageInput.addEventListener('input', () => {
            this.welcomeMessageInput.style.height = 'auto';
            this.welcomeMessageInput.style.height = Math.min(this.welcomeMessageInput.scrollHeight, 120) + 'px';
        });

        // Attachment events
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.attachImageBtn.addEventListener('click', () => this.imageInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileAttachment(e, 'file'));
        this.imageInput.addEventListener('change', (e) => this.handleFileAttachment(e, 'image'));

        // Audio recording events
        this.recordAudioBtn.addEventListener('click', () => this.openAudioModal());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.closeAudioModal.addEventListener('click', () => this.closeAudioModalFunc());

        // History events
        this.refreshHistoryBtn.addEventListener('click', () => this.refreshHistory());
        this.selectAllHistoryBtn.addEventListener('click', () => this.toggleSelectAll());
        this.clearSelectedHistoryBtn.addEventListener('click', () => this.clearSelectedHistory());

        // Search events
        this.searchBtn.addEventListener('click', () => this.performSearch());
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Module events
        this.moduleCards.forEach(card => {
            card.addEventListener('click', () => {
                const module = card.dataset.module;
                this.handleModuleClick(module);
            });
        });

        // Welcome card events
        this.welcomeCards.forEach(card => {
            card.addEventListener('click', () => {
                const suggestion = card.dataset.suggestion;
                this.handleSuggestionClick(suggestion);
            });
        });

        // New Chat button event
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
    }

    initializeSplitTextAnimations() {
        // Disable SplitText animations for now
        // if (typeof gsap !== 'undefined' && typeof SplitText !== 'undefined') {
        //     gsap.registerPlugin(ScrollTrigger);
        //     this.initializeModulesTitleAnimation();
        // }
    }

    initializeModulesTitleAnimation() {
        if (!this.modulesTitle) return;
        const splitText = new SplitText(this.modulesTitle, {
            type: "chars",
            charsClass: "char"
        });
        gsap.set(splitText.chars, {
            opacity: 0,
            y: 40,
            rotationX: -90
        });
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: this.modulesTitle,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });
        tl.to(splitText.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05
        });
        return () => {
            splitText.revert();
            tl.kill();
        };
    }

    initializeWelcomeAnimations() {
        if (!this.welcomeCards.length) return;
        this.welcomeCards.forEach((card, index) => {
            card.classList.add('gsap-tilt', 'gsap-glow');
            this.initializeParticleSystem(card);
            this.initializeTiltAndMagnetism(card);
            this.initializeGlowEffect(card);
            this.initializeClickEffect(card);
        });
    }

    initializeParticleSystem(card) {
        const particleCount = 8;
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: rgba(59, 130, 246, 1);
                box-shadow: 0 0 6px rgba(59, 130, 246, 0.6);
                pointer-events: none;
                z-index: 100;
                opacity: 0;
            `;
            card.appendChild(particle);
            particles.push(particle);
        }
        card.addEventListener('mouseenter', () => {
            particles.forEach((particle, index) => {
                setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    const x = Math.random() * rect.width;
                    const y = Math.random() * rect.height;
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    gsap.fromTo(particle, {
                        scale: 0,
                        opacity: 0
                    }, {
                        scale: 1,
                        opacity: 1,
                        duration: 0.3,
                        ease: "back.out(1.7)"
                    });
                    gsap.to(particle, {
                        x: (Math.random() - 0.5) * 50,
                        y: (Math.random() - 0.5) * 50,
                        rotation: Math.random() * 360,
                        duration: 2 + Math.random() * 2,
                        ease: "none",
                        repeat: -1,
                        yoyo: true,
                    });
                    gsap.to(particle, {
                        opacity: 0.3,
                        duration: 1.5,
                        ease: "power2.inOut",
                        repeat: -1,
                        yoyo: true,
                    });
                }, index * 100);
            });
        });
        card.addEventListener('mouseleave', () => {
            particles.forEach(particle => {
                gsap.to(particle, {
                    scale: 0,
                    opacity: 0,
                    duration: 0.3,
                    ease: "back.in(1.7)",
                });
            });
        });
    }

    initializeTiltAndMagnetism(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;
            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: "power2.out",
                transformPerspective: 1000,
            });
            const magnetX = (x - centerX) * 0.03;
            const magnetY = (y - centerY) * 0.03;
            gsap.to(card, {
                x: magnetX,
                y: magnetY,
                duration: 0.3,
                ease: "power2.out",
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                duration: 0.3,
                ease: "power2.out",
            });
        });
    }

    initializeGlowEffect(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const relativeX = (x / rect.width) * 100;
            const relativeY = (y / rect.height) * 100;
            card.style.setProperty('--glow-x', `${relativeX}%`);
            card.style.setProperty('--glow-y', `${relativeY}%`);
            card.style.setProperty('--glow-intensity', '1');
        });
        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--glow-intensity', '0');
        });
    }

    initializeClickEffect(card) {
        card.addEventListener('click', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const maxDistance = Math.max(
                Math.hypot(x, y),
                Math.hypot(x - rect.width, y),
                Math.hypot(x, y - rect.height),
                Math.hypot(x - rect.width, y - rect.height)
            );
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                width: ${maxDistance * 2}px;
                height: ${maxDistance * 2}px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 30%, transparent 70%);
                left: ${x - maxDistance}px;
                top: ${y - maxDistance}px;
                pointer-events: none;
                z-index: 1000;
            `;
            card.appendChild(ripple);
            gsap.fromTo(ripple, {
                scale: 0,
                opacity: 1
            }, {
                scale: 1,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                onComplete: () => ripple.remove()
            });
        });
    }

    switchTab(tabName) {
        this.navItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        this.tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        if (tabName === 'modules' && this.modulesTitle) {
            setTimeout(() => {
                this.initializeModulesTitleAnimation();
            }, 100);
        }
    }

    handleModuleClick(module) {
        // R Support Academy modules - redirect to YouTube
        const youtubeModules = [
            'bibliometric-rstudio',
            'data-collection', 
            'bibliometric-techniques',
            'data-visualization'
        ];

        if (youtubeModules.includes(module)) {
            // Open ThinkNeuro YouTube channel in a new tab
            window.open('https://www.youtube.com/@ThinkNeuroUSA/videos', '_blank');
            return;
        }

        // For other modules (Frequently Asked), continue with chat
        this.switchTab('chat');
        const moduleMessages = {
            // New questions from modified "Frequently Asked" sidebar
            'bibliometrics-intro': "What is bibliometrics?",
            'r-vs-rstudio': "What is the difference between R and RStudio?",
            'assigning-variables': "How do I assign a variable in R?",
            'about-ggplot2': "Tell me about the ggplot2 package.",
            'about-dplyr': "What does the dplyr package do?",
            'review-my-code': "Can you review my R code and suggest improvements?",
            'what-is-pvalue': "What is a p-value in statistics?"
        };
        const message = moduleMessages[module] || "Tell me about R programming.";
        this.messageInput.value = message;
        this.sendMessage();
    }

    handleSuggestionClick(suggestion) {
        const suggestionMessages = {
            basics: "I'm new to R programming. Can you teach me the basics?",
            data: "I need help with data analysis in R. Where should I start?",
            visualization: "I want to create charts and graphs in R. Can you help?",
            code: "I have some R code that's not working. Can you review it?"
        };
        const message = suggestionMessages[suggestion] || "I need help with R programming.";
        this.welcomeMessageInput.value = message;
        this.sendWelcomeMessage();
    }

    createNewChat() {
        // 1. Reset the current chat state in the frontend.
        //    This is the most critical step. The next message sent will now
        //    be treated as the start of a brand new chat.
        this.currentChat = null;

        // 2. Clear all messages from the display.
        this.chatMessages.innerHTML = '';

        // 3. Hide any suggested prompts.
        this.displaySuggestedPrompts([]);

        // 4. Show the original welcome screen again.
        this.showWelcomeMessage();

        // 5. Clear the main message input box.
        this.messageInput.value = '';

        // 6. Clear the welcome message input box too.
        this.welcomeMessageInput.value = '';

        // 7. De-select any active chat in the history panel by re-rendering it.
        this.updateHistoryPanel();
    }

    async sendMessage(isWelcomeMessage = false) {
        const inputElement = isWelcomeMessage ? this.welcomeMessageInput : this.messageInput;
        const message = inputElement.value.trim();
        if (!message && this.attachments.length === 0) return;

        if (this.welcomeContainer && this.welcomeContainer.style.display !== 'none') {
            this.welcomeContainer.style.display = 'none';
        }

        // Add user message to UI immediately for responsiveness
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: message,
            attachments: [...this.attachments],
            timestamp: new Date()
        };
        this.addMessageToChatUI(userMessage);
        inputElement.value = '';
        inputElement.style.height = 'auto';
        this.attachments = [];
        this.updateAttachmentsDisplay();

        this.showTypingIndicator();
        this.displaySuggestedPrompts([]);

        try {
            // --- MODIFIED: Send chat_id to backend ---
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: message,
                    chat_id: this.currentChat ? this.currentChat.id : null
                }),
            });

            // First check if we got a valid HTTP response
            if (!response.ok) {
                // Handle HTTP errors (like 500, 404, etc.)
                let errorMessage = `Server error (${response.status})`;
                try {
                    // Try to parse error response as JSON if possible
                    const errorData = await response.json();
                    if (errorData.answer) {
                        errorMessage = errorData.answer;
                    } else if (errorData.error) {
                        errorMessage = `Error: ${errorData.error}`;
                    }
                } catch {
                    // If JSON parsing fails, use a generic message
                    errorMessage = `Server error (${response.status}): Please check your configuration and try again.`;
                }
                
                this.hideTypingIndicator();
                const errorResponse = {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: errorMessage,
                    timestamp: new Date()
                };
                this.addMessageToChatUI(errorResponse);
                return; // Exit early for HTTP errors
            }
            
            // If we get here, the HTTP response was successful (200)
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                this.hideTypingIndicator();
                const errorResponse = {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: 'Received an invalid response from the server. Please try again.',
                    timestamp: new Date()
                };
                this.addMessageToChatUI(errorResponse);
                return;
            }

            // =================================================================
            // --- THIS IS THE FIX ---
            // Check if the backend returned its specific error format.
            if (data.error) {
                // If there's an error, just display the error message and stop.
                // Do not try to process chat_id or sources that don't exist.
                this.hideTypingIndicator();
                const errorResponse = {
                    id: Date.now() + 1,
                    type: 'ai',
                    text: data.answer, // Use the friendly error message from the backend
                    timestamp: new Date()
                };
                this.addMessageToChatUI(errorResponse);
                return; // Exit the function to prevent further errors.
            }
            // --- END OF FIX ---
            // =================================================================

            // This code below will now ONLY run if the backend response was successful.
            // Backend now handles saving, we just need to update the UI
            const isNewChat = !this.currentChat;
            if (isNewChat) {
                // If this was a new chat, INSTEAD of re-fetching the whole history,
                // we will intelligently add the new chat to the top of our list.
                const chat_title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
                const newChatSummary = { 
                    id: data.chat_id, 
                    title: chat_title, 
                    messages: [userMessage], // for the preview
                    timestamp: new Date().toISOString() 
                };
                
                // Add to our local state array
                if (!this.chatHistory) {
                    this.chatHistory = [];
                }
                this.chatHistory.unshift(newChatSummary);
                
                // Instead of rebuilding entire panel, just add the new item at the top
                this.addNewChatToHistoryPanel(newChatSummary);
            }

            // Set the current chat ID from the backend's response
            if (!this.currentChat) {
                this.currentChat = { id: data.chat_id, messages: [userMessage] };
            } else {
                this.currentChat.id = data.chat_id;
            }

            const aiResponse = {
                id: Date.now() + 1,
                type: 'ai',
                text: data.answer,
                sources: data.sources || [],
                timestamp: new Date()
            };

            this.hideTypingIndicator();
            this.addMessageToChatUI(aiResponse); // Add AI response to UI
            this.displaySuggestedPrompts(data.suggested_prompts || []);
            
            // Ensure the correct chat is marked as active in the history panel
            this.updateHistoryPanel();

        } catch (error) {
            console.error('Error fetching AI response:', error);
            this.hideTypingIndicator();
            const errorResponse = {
                id: Date.now() + 1,
                type: 'ai',
                text: 'Sorry, I am having trouble connecting to the server.',
                timestamp: new Date()
            };
            this.addMessageToChatUI(errorResponse);
        }
    }

    async sendWelcomeMessage() {
        return this.sendMessage(true);
    }

    addMessageToChatUI(message) {
        const messageElement = this.createMessageElement(message);
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;
        const content = document.createElement('div');
        content.className = 'message-content';
        const text = document.createElement('div');
        text.className = 'message-text';
        text.innerHTML = this.formatMessageText(message.text);
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatTime(message.timestamp);
        content.appendChild(text);

        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
                const attachmentElement = this.createAttachmentElement(attachment);
                content.appendChild(attachmentElement);
            });
        }

        if (message.sources && message.sources.length > 0) {
            const sourcesContainer = document.createElement('div');
            sourcesContainer.className = 'message-sources';
            const sourcesTitle = document.createElement('h4');
            sourcesTitle.textContent = 'Sources:';
            sourcesContainer.appendChild(sourcesTitle);
            message.sources.forEach(source => {
                const sourceLink = document.createElement('a');
                sourceLink.className = 'source-link';
                sourceLink.target = '_blank';
                // Use a non-functional href to prevent page reloads, as we don't have direct URLs.
                sourceLink.href = '#'; 

                let displayText = 'Unknown Source';

                // Case 1: Handle sources from course modules (JSON)
                if (source.source_module) {
                    displayText = `${source.source_module} (at ${source.timestamp})`;
                }
                // Case 2: Handle sources from documents (PDFs)
                else if (source.source) {
                    const filename = source.source.split(/[\\/]/).pop(); // Extracts the filename from the path
                    displayText = filename;
                    if (source.page !== undefined) {
                        // Add 1 to the page number because it's often 0-indexed
                        displayText += ` (Page ${source.page + 1})`;
                    }
                }

                sourceLink.innerHTML = `<i class="fas fa-book-open"></i> ${displayText}`;
                sourcesContainer.appendChild(sourceLink);
            });
            content.appendChild(sourcesContainer);
        }

        content.appendChild(time);
        messageDiv.appendChild(content);
        return messageDiv;
    }

    displaySuggestedPrompts(prompts) {
        const container = document.getElementById('suggested-prompts-container');
        if (!container) return;
        container.innerHTML = '';
        if (prompts && prompts.length > 0) {
            prompts.forEach(promptText => {
                const button = document.createElement('button');
                button.className = 'suggestion-btn';
                button.textContent = promptText.replace(/^\d+\.\s*/, '');
                button.addEventListener('click', () => {
                    this.messageInput.value = button.textContent;
                    this.sendMessage();
                });
                container.appendChild(button);
            });
        }
    }

    formatMessageText(text) {
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block">
                <div class="code-header">
                    <span>${lang || 'Code'}</span>
                    <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
                </div>
                <div class="code-content">${this.escapeHtml(code.trim())}</div>
            </div>`;
        });
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        return text;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createAttachmentElement(attachment) {
        const attachmentDiv = document.createElement('div');
        attachmentDiv.className = 'attachment';
        const icon = document.createElement('div');
        icon.className = 'attachment-icon';
        icon.innerHTML = attachment.type === 'image' ? '<i class="fas fa-image"></i>' : '<i class="fas fa-file"></i>';
        const info = document.createElement('div');
        info.className = 'attachment-info';
        const name = document.createElement('div');
        name.className = 'attachment-name';
        name.textContent = attachment.name;
        const size = document.createElement('div');
        size.className = 'attachment-size';
        size.textContent = this.formatFileSize(attachment.size);
        info.appendChild(name);
        info.appendChild(size);
        attachmentDiv.appendChild(icon);
        attachmentDiv.appendChild(info);
        return attachmentDiv;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatTime(date) {
        try {
            // Handle both string timestamps and Date objects
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            
            // Check if date is valid
            if (isNaN(dateObj.getTime())) {
                return 'Unknown time';
            }
            
            return new Intl.DateTimeFormat('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(dateObj);
        } catch (error) {
            console.error('Error formatting time:', error, 'Date value:', date);
            return 'Unknown time';
        }
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-indicator';
        typingDiv.id = 'typing-indicator';
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<div class="loading"><div class="loading-spinner"></div>ThinkBot AI is typing...</div>';
        typingDiv.appendChild(content);
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    handleFileAttachment(event, type) {
        const files = event.target.files;
        if (files.length === 0) return;
        const file = files[0];
        const attachment = {
            id: Date.now(),
            name: file.name,
            size: file.size,
            type: type,
            file: file
        };
        this.attachments.push(attachment);
        this.updateAttachmentsDisplay();
        event.target.value = '';
    }

    updateAttachmentsDisplay() {
        const existingAttachments = document.querySelectorAll('.attachment-display');
        existingAttachments.forEach(att => att.remove());
        if (this.attachments.length > 0) {
            const attachmentsContainer = document.createElement('div');
            attachmentsContainer.className = 'attachments-container';
            attachmentsContainer.style.marginBottom = '8px';
            this.attachments.forEach(attachment => {
                const attachmentDiv = document.createElement('div');
                attachmentDiv.className = 'attachment attachment-display';
                const icon = document.createElement('div');
                icon.className = 'attachment-icon';
                icon.innerHTML = attachment.type === 'image' ? '<i class="fas fa-image"></i>' : '<i class="fas fa-file"></i>';
                const info = document.createElement('div');
                info.className = 'attachment-info';
                const name = document.createElement('div');
                name.className = 'attachment-name';
                name.textContent = attachment.name;
                const size = document.createElement('div');
                size.className = 'attachment-size';
                size.textContent = this.formatFileSize(attachment.size);
                const removeBtn = document.createElement('button');
                removeBtn.className = 'attachment-remove';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.onclick = () => this.removeAttachment(attachment.id);
                info.appendChild(name);
                info.appendChild(size);
                attachmentDiv.appendChild(icon);
                attachmentDiv.appendChild(info);
                attachmentDiv.appendChild(removeBtn);
                attachmentsContainer.appendChild(attachmentDiv);
            });
            const inputContainer = document.querySelector('.input-wrapper');
            inputContainer.parentNode.insertBefore(attachmentsContainer, inputContainer);
        }
    }

    removeAttachment(id) {
        this.attachments = this.attachments.filter(att => att.id !== id);
        this.updateAttachmentsDisplay();
    }

    openAudioModal() {
        this.audioModal.classList.add('active');
    }

    closeAudioModalFunc() {
        this.audioModal.classList.remove('active');
        this.stopRecording();
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordingChunks = [];
            this.mediaRecorder.ondataavailable = (event) => {
                this.recordingChunks.push(event.data);
            };
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.recordingChunks, {
                    type: 'audio/wav'
                });
                this.handleAudioAttachment(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            this.mediaRecorder.start();
            this.isRecording = true;
            this.recordingStartTime = Date.now();
            this.recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            this.recordBtn.style.backgroundColor = '#dc3545';
            this.recorderStatus.textContent = 'Recording...';
            this.recordingTime.style.display = 'block';
            this.startRecordingTimer();
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
            this.recordBtn.style.backgroundColor = '';
            this.recorderStatus.textContent = 'Click to start recording';
            this.recordingTime.style.display = 'none';
            this.stopRecordingTimer();
            this.closeAudioModalFunc();
        }
    }

    startRecordingTimer() {
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            this.recordingTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    handleAudioAttachment(audioBlob) {
        const attachment = {
            id: Date.now(),
            name: `audio_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.wav`,
            size: audioBlob.size,
            type: 'audio',
            file: audioBlob
        };
        this.attachments.push(attachment);
        this.updateAttachmentsDisplay();
    }

    performSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;
        const results = this.searchChatHistory(query);
        this.displaySearchResults(results);
    }

    searchChatHistory(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        // We only have access to chat.title on the client-side,
        // so we will search within that.
        this.chatHistory.forEach(chat => {
            if (chat && chat.title) {
                // Check if the lowercase title includes the search term.
                if (chat.title.toLowerCase().includes(searchTerm)) {
                    // If it matches, add the entire chat object to the results.
                    // We add a 'messages' array with a placeholder for consistency with
                    // what the displaySearchResults function expects.
                    results.push({
                        chat: chat,
                        messages: [{ text: chat.title }] // Use the title as the preview text
                    });
                }
            }
        });
        return results;
    }

    displaySearchResults(results) {
        this.searchResults.innerHTML = '';
        if (results.length === 0) {
            this.searchResults.innerHTML = '<div class="text-center">No results found</div>';
            return;
        }
        results.forEach(result => {
            const resultDiv = document.createElement('div');
            resultDiv.className = 'search-result-item';
            resultDiv.innerHTML = `
                <div class="history-title">${result.chat.title}</div>
                <div class="history-preview">${result.messages[0].text.substring(0, 100)}...</div>
                <div class="history-time">${this.formatTime(result.chat.timestamp)}</div>
            `;
            resultDiv.addEventListener('click', () => this.loadChat(result.chat.id));
            this.searchResults.appendChild(resultDiv);
        });
    }

    // --- NEW METHOD ---
    async fetchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/history`);
            if (!response.ok) {
                throw new Error('Failed to fetch chat history');
            }
            this.chatHistory = await response.json();
            this.updateHistoryPanel();
        } catch (error) {
            console.error("Error fetching history:", error);
            this.historyList.innerHTML = '<div class="text-center">Error loading history.</div>';
        }
    }

    updateHistoryPanel() {
        this.historyList.innerHTML = '';
        if (!this.chatHistory || this.chatHistory.length === 0) {
            this.historyList.innerHTML = '<div class="text-center">No chat history</div>';
            return;
        }
        this.chatHistory.forEach(chat => {
            if (!chat || !chat.id) return; // Skip invalid chat objects
            
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            if (this.currentChat && this.currentChat.id === chat.id) {
                historyItem.classList.add('active');
            }
            const checkbox = document.createElement('div');
            checkbox.className = 'history-checkbox';
            if (this.selectedHistoryItems.has(chat.id)) {
                checkbox.classList.add('checked');
            }
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleHistorySelection(chat.id, checkbox);
            });
            const content = document.createElement('div');
            content.className = 'history-content';
            
            // Safe access to chat properties
            const title = chat.title || 'Untitled Chat';
            const preview = chat.title || 'No messages...';
            const timestamp = chat.timestamp || new Date().toISOString();
            
            content.innerHTML = `
                <div class="history-title">${title}</div>
                <div class="history-preview">${preview}</div>
                <div class="history-time">${this.formatTime(timestamp)}</div>
            `;
            historyItem.appendChild(checkbox);
            historyItem.appendChild(content);
            historyItem.addEventListener('click', () => this.loadChat(chat.id));
            this.historyList.appendChild(historyItem);
        });
        this.updateHistoryActions();
    }

    // NEW: Efficiently add a single new chat to the top of the history panel
    addNewChatToHistoryPanel(chat) {
        // Create the new history item
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item active'; // Mark as active since it's the current chat
        
        const checkbox = document.createElement('div');
        checkbox.className = 'history-checkbox';
        checkbox.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleHistorySelection(chat.id, checkbox);
        });
        
        const content = document.createElement('div');
        content.className = 'history-content';
        
        const title = chat.title || 'Untitled Chat';
        const preview = chat.title || 'No messages...';
        const timestamp = chat.timestamp || new Date().toISOString();
        
        content.innerHTML = `
            <div class="history-title">${title}</div>
            <div class="history-preview">${preview}</div>
            <div class="history-time">${this.formatTime(timestamp)}</div>
        `;
        
        historyItem.appendChild(checkbox);
        historyItem.appendChild(content);
        historyItem.addEventListener('click', () => this.loadChat(chat.id));
        
        // Remove active class from other items
        this.historyList.querySelectorAll('.history-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add to the TOP of the history list
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
        
        // Update the current chat reference
        this.currentChat = chat;
    }

    toggleHistorySelection(chatId, checkbox) {
        if (this.selectedHistoryItems.has(chatId)) {
            this.selectedHistoryItems.delete(chatId);
            checkbox.classList.remove('checked');
        } else {
            this.selectedHistoryItems.add(chatId);
            checkbox.classList.add('checked');
        }
        this.updateHistoryActions();
    }

    toggleSelectAll() {
        const checkboxes = document.querySelectorAll('.history-checkbox');
        const allSelected = checkboxes.length > 0 &&
            Array.from(checkboxes).every(cb => cb.classList.contains('checked'));
        if (allSelected) {
            this.selectedHistoryItems.clear();
            checkboxes.forEach(cb => cb.classList.remove('checked'));
        } else {
            this.chatHistory.forEach(chat => {
                this.selectedHistoryItems.add(chat.id);
            });
            checkboxes.forEach(cb => cb.classList.add('checked'));
        }
        this.updateHistoryActions();
    }

    updateHistoryActions() {
        const hasSelected = this.selectedHistoryItems.size > 0;
        this.clearSelectedHistoryBtn.style.display = hasSelected ? 'flex' : 'none';
        const checkboxes = document.querySelectorAll('.history-checkbox');
        const allSelected = checkboxes.length > 0 &&
            Array.from(checkboxes).every(cb => cb.classList.contains('checked'));
        this.selectAllHistoryBtn.innerHTML = allSelected ?
            '<i class="fas fa-square"></i>' :
            '<i class="fas fa-check-square"></i>';
    }

    async clearSelectedHistory() {
        if (this.selectedHistoryItems.size === 0) return;

        const confirmMessage = this.selectedHistoryItems.size === 1 ?
            'Are you sure you want to delete this chat?' :
            `Are you sure you want to delete ${this.selectedHistoryItems.size} chats?`;

        if (confirm(confirmMessage)) {
            // Convert the Set of IDs to an Array for the API call
            const idsToDelete = Array.from(this.selectedHistoryItems);

            try {
                // --- FIX APPLIED HERE: Call the backend to delete the chats ---
                const response = await fetch(`${API_BASE_URL}/history/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: idsToDelete }),
                });

                if (!response.ok) {
                    throw new Error('Failed to delete chats on the server.');
                }

                // --- If the API call was successful, update the UI ---
                
                // 1. Filter the local chatHistory array
                this.chatHistory = this.chatHistory.filter(chat =>
                    !this.selectedHistoryItems.has(chat.id)
                );

                // 2. If the currently open chat was deleted, clear the view
                if (this.currentChat && this.selectedHistoryItems.has(this.currentChat.id)) {
                    this.currentChat = null;
                    this.chatMessages.innerHTML = '';
                    this.showWelcomeMessage();
                }

                // 3. Clear the selection set
                this.selectedHistoryItems.clear();

                // 4. Re-render the history panel with the updated data
                this.updateHistoryPanel();

            } catch (error) {
                console.error('Error deleting chat history:', error);
                alert('Could not delete chats. Please try again.');
            }
        }
    }

    showWelcomeMessage() {
        if (this.welcomeContainer) {
            this.welcomeContainer.style.display = 'flex';
        }
    }

    async loadChat(chatId) {
        if (!this.chatHistory || !Array.isArray(this.chatHistory)) {
            console.error('Chat history is not available');
            return;
        }
        
        const chat = this.chatHistory.find(c => c && c.id === chatId);
        if (!chat) {
            console.error('Chat not found:', chatId);
            return;
        }
        
        try {
            // Fetch the complete chat messages from the backend
            const response = await fetch(`${API_BASE_URL}/chats/${chatId}`);
            
            // The response is the array of messages itself.
            const messagesArray = await response.json(); 
            
            // --- FIX APPLIED HERE ---
            // Update the current chat's messages with the fetched array.
            this.currentChat = { ...chat, messages: messagesArray || [] };
            this.chatMessages.innerHTML = '';
            
            // --- FIX APPLIED HERE ---
            // Load all messages by iterating directly over the messagesArray.
            if (messagesArray && Array.isArray(messagesArray)) {
                messagesArray.forEach(message => {
                    // The createMessageElement function is already correct.
                    const messageElement = this.createMessageElement(message);
                    this.chatMessages.appendChild(messageElement);
                });
            }
            
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
            this.updateHistoryPanel(); // This highlights the correct chat
            
            // Hide the welcome message when a chat is loaded
            if (this.welcomeContainer) {
                this.welcomeContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Error loading chat:', error);
            // Optionally display an error to the user in the chat window
            this.chatMessages.innerHTML = '<div class="message ai"><div class="message-content">Sorry, there was an error loading this chat.</div></div>';
        }
    }

    loadInitialChat() {
        if (this.chatHistory.length > 0) {
            this.loadChat(this.chatHistory[0].id);
        }
    }

    refreshHistory() {
        this.updateHistoryPanel();
    }

    saveCurrentChat() {
        if (this.currentChat && this.currentChat.messages.length > 1) {
            const existingIndex = this.chatHistory.findIndex(c => c.id === this.currentChat.id);
            if (existingIndex >= 0) {
                this.chatHistory[existingIndex] = { ...this.currentChat
                };
            } else {
                this.chatHistory.unshift({ ...this.currentChat
                });
            }
            this.saveChatHistory();
        }
    }
}

function copyToClipboard(button) {
    const codeContent = button.parentElement.nextElementSibling.textContent;
    navigator.clipboard.writeText(codeContent).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    window.thinkBot = new ThinkBotAI();
});

// Global error handlers to prevent page resets
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the default behavior which might reload the page
    event.preventDefault();
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Log the error but don't reload the page
});

// --- Removed unreliable beforeunload listener ---
// Chat history is now saved after every message in addMessageToChat()
// This ensures reliable saving without depending on browser events