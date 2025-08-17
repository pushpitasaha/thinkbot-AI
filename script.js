// ThinkCode AI - Main JavaScript File

class ThinkCodeAI {
    constructor() {
        this.currentChat = null;
        this.chatHistory = this.loadChatHistory();
        this.attachments = [];
        this.mediaRecorder = null;
        this.recordingChunks = [];
        this.isRecording = false;
        this.recordingTimer = null;
        this.recordingStartTime = null;
        this.selectedHistoryItems = new Set();
        
        this.initializeElements();
        this.bindEvents();
        this.loadInitialChat();
        this.updateHistoryPanel();
        this.initializeWelcomeAnimations();
        this.initializeSplitTextAnimations();
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
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Welcome input events
        this.welcomeSendButton.addEventListener('click', () => this.sendWelcomeMessage());
        this.welcomeMessageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendWelcomeMessage();
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
    }

    initializeSplitTextAnimations() {
        // Register GSAP plugins
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            
            // Initialize SplitText animation for modules title
            this.initializeModulesTitleAnimation();
        }
    }

    initializeModulesTitleAnimation() {
        if (!this.modulesTitle) return;

        // Create SplitText instance
        const splitText = new SplitText(this.modulesTitle, {
            type: "chars",
            charsClass: "char"
        });

        // Set initial state
        gsap.set(splitText.chars, {
            opacity: 0,
            y: 40,
            rotationX: -90
        });

        // Create animation timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: this.modulesTitle,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
            }
        });

        // Animate characters
        tl.to(splitText.chars, {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.05
        });

        // Cleanup function
        return () => {
            splitText.revert();
            tl.kill();
        };
    }

    initializeWelcomeAnimations() {
        if (!this.welcomeCards.length) return;

        this.welcomeCards.forEach((card, index) => {
            // Add GSAP classes
            card.classList.add('gsap-tilt', 'gsap-glow');
            
            // Initialize particle system
            this.initializeParticleSystem(card);
            
            // Initialize tilt and magnetism
            this.initializeTiltAndMagnetism(card);
            
            // Initialize glow effect
            this.initializeGlowEffect(card);
            
            // Initialize click effect
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
                const timeoutId = setTimeout(() => {
                    const rect = card.getBoundingClientRect();
                    const x = Math.random() * rect.width;
                    const y = Math.random() * rect.height;
                    
                    particle.style.left = x + 'px';
                    particle.style.top = y + 'px';
                    
                    gsap.fromTo(particle, 
                        { scale: 0, opacity: 0 },
                        { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
                    );

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

            // Tilt effect
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            gsap.to(card, {
                rotateX,
                rotateY,
                duration: 0.1,
                ease: "power2.out",
                transformPerspective: 1000,
            });

            // Magnetism effect
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

            gsap.fromTo(ripple, 
                { scale: 0, opacity: 1 },
                { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() }
            );
        });
    }

    switchTab(tabName) {
        // Update navigation
        this.navItems.forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        this.tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Trigger SplitText animation when modules tab is opened
        if (tabName === 'modules' && this.modulesTitle) {
            setTimeout(() => {
                this.initializeModulesTitleAnimation();
            }, 100);
        }
    }

    handleModuleClick(module) {
        // Switch to chat tab and send a module-specific message
        this.switchTab('chat');
        
        const moduleMessages = {
            'bibliometric-rstudio': "I'd like to learn about bibliometric analysis and RStudio. Can you help me get started?",
            'data-collection': "I want to learn about data collection and preparation in R. What should I know?",
            'bibliometric-techniques': "I'm interested in bibliometric analysis techniques. Can you show me some examples?",
            'data-visualization': "I need help with data visualization and interpretation in R. Where should I begin?",
            basics: "I'd like to learn about R basics. Can you help me get started?",
            data: "I want to learn about data manipulation in R. What should I know?",
            visualization: "I'm interested in data visualization with R. Can you show me some examples?",
            statistics: "I need help with statistical analysis in R. Where should I begin?",
            packages: "I want to learn about R packages. Which ones are most important?",
            advanced: "I'm ready for advanced R programming concepts. What should I focus on?"
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

    sendWelcomeMessage() {
        const message = this.welcomeMessageInput.value.trim();
        if (!message) return;

        // Hide welcome message when first message is sent
        if (this.welcomeContainer && this.welcomeContainer.style.display !== 'none') {
            this.welcomeContainer.style.display = 'none';
        }

        // Create user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: message,
            attachments: [],
            timestamp: new Date()
        };

        this.addMessageToChat(userMessage);
        this.welcomeMessageInput.value = '';
        this.welcomeMessageInput.style.height = 'auto';

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message, []);
            this.addMessageToChat(aiResponse);
        }, 1000 + Math.random() * 2000);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message && this.attachments.length === 0) return;

        // Hide welcome message when first message is sent
        if (this.welcomeContainer && this.welcomeContainer.style.display !== 'none') {
            this.welcomeContainer.style.display = 'none';
        }

        // Create user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            text: message,
            attachments: [...this.attachments],
            timestamp: new Date()
        };

        this.addMessageToChat(userMessage);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.attachments = [];
        this.updateAttachmentsDisplay();

        // Show typing indicator
        this.showTypingIndicator();

        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            const aiResponse = this.generateAIResponse(message, userMessage.attachments);
            this.addMessageToChat(aiResponse);
        }, 1000 + Math.random() * 2000);
    }

    addMessageToChat(message) {
        const messageElement = this.createMessageElement(message);
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Save to current chat
        if (!this.currentChat) {
            this.currentChat = {
                id: Date.now(),
                title: message.text.substring(0, 50) + (message.text.length > 50 ? '...' : ''),
                messages: [],
                timestamp: new Date()
            };
        }
        this.currentChat.messages.push(message);

        // Update history
        this.updateHistoryPanel();
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

        // Add attachments if any
        if (message.attachments && message.attachments.length > 0) {
            message.attachments.forEach(attachment => {
                const attachmentElement = this.createAttachmentElement(attachment);
                content.appendChild(attachmentElement);
            });
        }

        content.appendChild(time);

        messageDiv.appendChild(content);

        return messageDiv;
    }

    formatMessageText(text) {
        // Convert URLs to links
        text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // Convert code blocks
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block">
                <div class="code-header">
                    <span>${lang || 'Code'}</span>
                    <button class="copy-btn" onclick="copyToClipboard(this)">Copy</button>
                </div>
                <div class="code-content">${this.escapeHtml(code.trim())}</div>
            </div>`;
        });

        // Convert inline code
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
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.innerHTML = '<div class="loading"><div class="loading-spinner"></div>ThinkCode AI is typing...</div>';

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

    generateAIResponse(userMessage, attachments) {
        const responses = [
            "I'd be happy to help you with that! Here's what you need to know about R programming...",
            "Great question! Let me explain this concept in R...",
            "Here's how you can approach this in R...",
            "I'll show you the R code for this...",
            "This is a common scenario in R. Here's the solution...",
            "Let me walk you through this step by step in R..."
        ];

        let response = responses[Math.floor(Math.random() * responses.length)];

        // Add code example if the message contains programming-related keywords
        if (userMessage.toLowerCase().includes('code') || 
            userMessage.toLowerCase().includes('example') ||
            userMessage.toLowerCase().includes('how to')) {
            response += "\n\nHere's an example:\n```r\n# Sample R code\ndata <- c(1, 2, 3, 4, 5)\nmean(data)\nplot(data)\n```";
        }

        return {
            id: Date.now() + 1,
            type: 'ai',
            text: response,
            timestamp: new Date()
        };
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

        // Clear the input
        event.target.value = '';
    }

    updateAttachmentsDisplay() {
        // Remove existing attachment displays
        const existingAttachments = document.querySelectorAll('.attachment-display');
        existingAttachments.forEach(att => att.remove());

        // Add new attachment displays
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordingChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.recordingChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.recordingChunks, { type: 'audio/wav' });
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

        this.chatHistory.forEach(chat => {
            const matchingMessages = chat.messages.filter(message => 
                message.text.toLowerCase().includes(searchTerm)
            );

            if (matchingMessages.length > 0) {
                results.push({
                    chat: chat,
                    messages: matchingMessages
                });
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

    loadChatHistory() {
        const saved = localStorage.getItem('thinkbot_chat_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveChatHistory() {
        localStorage.setItem('thinkbot_chat_history', JSON.stringify(this.chatHistory));
    }

    updateHistoryPanel() {
        this.historyList.innerHTML = '';

        if (this.chatHistory.length === 0) {
            this.historyList.innerHTML = '<div class="text-center">No chat history</div>';
            return;
        }

        this.chatHistory.forEach(chat => {
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
            content.innerHTML = `
                <div class="history-title">${chat.title}</div>
                <div class="history-preview">${chat.messages[0]?.text.substring(0, 50) || 'No messages'}...</div>
                <div class="history-time">${this.formatTime(chat.timestamp)}</div>
            `;

            historyItem.appendChild(checkbox);
            historyItem.appendChild(content);
            historyItem.addEventListener('click', () => this.loadChat(chat.id));
            this.historyList.appendChild(historyItem);
        });

        this.updateHistoryActions();
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
            // Deselect all
            this.selectedHistoryItems.clear();
            checkboxes.forEach(cb => cb.classList.remove('checked'));
        } else {
            // Select all
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
        
        // Update select all button icon
        const checkboxes = document.querySelectorAll('.history-checkbox');
        const allSelected = checkboxes.length > 0 && 
            Array.from(checkboxes).every(cb => cb.classList.contains('checked'));
        
        this.selectAllHistoryBtn.innerHTML = allSelected ? 
            '<i class="fas fa-square"></i>' : 
            '<i class="fas fa-check-square"></i>';
    }

    clearSelectedHistory() {
        if (this.selectedHistoryItems.size === 0) return;

        const confirmMessage = this.selectedHistoryItems.size === 1 ? 
            'Are you sure you want to delete this chat?' :
            `Are you sure you want to delete ${this.selectedHistoryItems.size} chats?`;

        if (confirm(confirmMessage)) {
            // Remove selected chats from history
            this.chatHistory = this.chatHistory.filter(chat => 
                !this.selectedHistoryItems.has(chat.id)
            );

            // Clear current chat if it was selected
            if (this.currentChat && this.selectedHistoryItems.has(this.currentChat.id)) {
                this.currentChat = null;
                this.chatMessages.innerHTML = '';
                this.showWelcomeMessage();
            }

            this.selectedHistoryItems.clear();
            this.saveChatHistory();
            this.updateHistoryPanel();
        }
    }

    showWelcomeMessage() {
        if (this.welcomeContainer) {
            this.welcomeContainer.style.display = 'flex';
        }
    }

    loadChat(chatId) {
        const chat = this.chatHistory.find(c => c.id === chatId);
        if (!chat) return;

        this.currentChat = chat;
        this.chatMessages.innerHTML = '';
        chat.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.chatMessages.appendChild(messageElement);
        });

        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        this.updateHistoryPanel();
    }

    loadInitialChat() {
        if (this.chatHistory.length > 0) {
            this.loadChat(this.chatHistory[0].id);
        }
    }

    refreshHistory() {
        this.updateHistoryPanel();
    }

    // Save current chat to history when it has multiple messages
    saveCurrentChat() {
        if (this.currentChat && this.currentChat.messages.length > 1) {
            const existingIndex = this.chatHistory.findIndex(c => c.id === this.currentChat.id);
            if (existingIndex >= 0) {
                this.chatHistory[existingIndex] = { ...this.currentChat };
            } else {
                this.chatHistory.unshift({ ...this.currentChat });
            }
            this.saveChatHistory();
        }
    }
}

// Global function for copying code
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.thinkCode = new ThinkCodeAI();
});

// Save chat when leaving the page
window.addEventListener('beforeunload', () => {
    if (window.thinkCode) {
        window.thinkCode.saveCurrentChat();
    }
}); 