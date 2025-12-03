class JarvisAssistant {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.wakeWord = 'jarvis';
        this.currentTheme = 'default';
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.initializeSpeechSynthesis();
        this.initializeEventListeners();
        this.updateTime();
        
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    initializeElements() {
        this.voiceToggle = document.getElementById('voiceToggle');
        this.clearBtn = document.getElementById('clearBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeBtn = document.querySelector('.close-btn');
        this.commandHistory = document.getElementById('commandHistory');
        this.inputText = document.getElementById('inputText');
        this.voiceStatus = document.getElementById('voiceStatus');
        this.systemStatus = document.getElementById('systemStatus');
        this.powerLevel = document.getElementById('powerLevel');
        this.currentTime = document.getElementById('currentTime');
        
        // Settings elements
        this.voiceSelect = document.getElementById('voiceSelect');
        this.themeSelect = document.getElementById('themeSelect');
        this.wakeWordInput = document.getElementById('wakeWord');
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.addMessage('JARVIS', 'Speech recognition not supported in this browser.');
            this.voiceStatus.textContent = 'NOT SUPPORTED';
            this.voiceStatus.style.color = '#ff0000';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.voiceStatus.textContent = 'LISTENING';
            this.voiceStatus.style.color = '#00ff00';
            this.inputText.textContent = 'Listening...';
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.recognition.start();
            } else {
                this.voiceStatus.textContent = 'READY';
                this.voiceStatus.style.color = '#00ff00';
                this.inputText.textContent = 'Click microphone to start listening';
            }
        };

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            if (interimTranscript) {
                this.inputText.textContent = interimTranscript;
            }

            if (finalTranscript) {
                this.processCommand(finalTranscript.trim().toLowerCase());
                this.inputText.textContent = 'Processing...';
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.voiceStatus.textContent = 'ERROR';
            this.voiceStatus.style.color = '#ff0000';
            this.addMessage('SYSTEM', `Recognition error: ${event.error}`);
        };
    }

    initializeSpeechSynthesis() {
        // Wait for voices to load
        this.synth.onvoiceschanged = () => {
            this.voices = this.synth.getVoices();
        };
    }

    initializeEventListeners() {
        this.voiceToggle.addEventListener('click', () => this.toggleListening());
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeBtn.addEventListener('click', () => this.closeSettings());

        // Settings changes
        this.voiceSelect.addEventListener('change', (e) => this.changeVoice(e.target.value));
        this.themeSelect.addEventListener('change', (e) => this.changeTheme(e.target.value));
        this.wakeWordInput.addEventListener('change', (e) => {
            this.wakeWord = e.target.value.toLowerCase();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === ' ') {
                e.preventDefault();
                this.toggleListening();
            }
        });
    }

    toggleListening() {
        if (!this.recognition) {
            this.addMessage('JARVIS', 'Speech recognition is not available.');
            return;
        }

        this.isListening = !this.isListening;

        if (this.isListening) {
            this.recognition.start();
            this.voiceToggle.classList.add('active');
            this.voiceToggle.querySelector('.btn-text').textContent = 'VOICE ACTIVE';
            this.playSound('activation');
        } else {
            this.recognition.stop();
            this.voiceToggle.classList.remove('active');
            this.voiceToggle.querySelector('.btn-text').textContent = 'START VOICE';
            this.inputText.textContent = 'Click microphone to start listening';
        }
    }

    processCommand(command) {
        this.addMessage('USER', command);
        
        // Check for wake word
        if (command.includes(this.wakeWord)) {
            this.respondToWakeWord();
            return;
        }

        // Process commands
        const response = this.generateResponse(command);
        this.speak(response);
        this.addMessage('JARVIS', response);
    }

    generateResponse(command) {
        const responses = {
            greeting: [
                "Hello sir, how can I assist you today?",
                "Good to hear from you. What can I do for you?",
                "At your service. What do you need?"
            ],
            time: [
                `The current time is ${new Date().toLocaleTimeString()}`,
                `It's ${new Date().toLocaleTimeString()}`
            ],
            date: [
                `Today is ${new Date().toLocaleDateString()}`,
                `The date is ${new Date().toLocaleDateString()}`
            ],
            weather: [
                "I'm unable to access weather data in this demo version.",
                "Weather information requires an API connection."
            ],
            joke: [
                "Why don't scientists trust atoms? Because they make up everything!",
                "Why did the scarecrow win an award? He was outstanding in his field!",
                "I told my computer I needed a break, and it said '404 - Break not found'"
            ],
            default: [
                "I'm not sure how to help with that yet.",
                "That command isn't in my current programming.",
                "I'll need further instructions for that task."
            ]
        };

        if (command.includes('hello') || command.includes('hi')) {
            return this.getRandomResponse(responses.greeting);
        } else if (command.includes('time')) {
            return this.getRandomResponse(responses.time);
        } else if (command.includes('date')) {
            return this.getRandomResponse(responses.date);
        } else if (command.includes('weather')) {
            return this.getRandomResponse(responses.weather);
        } else if (command.includes('joke')) {
            return this.getRandomResponse(responses.joke);
        } else {
            return this.getRandomResponse(responses.default);
        }
    }

    respondToWakeWord() {
        const responses = [
            "Yes, I'm listening?",
            "At your service.",
            "How can I assist you?",
            "I'm here, what do you need?"
        ];
        const response = this.getRandomResponse(responses);
        this.speak(response);
        this.addMessage('JARVIS', response);
    }

    speak(text) {
        if (this.synth.speaking) {
            this.synth.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice based on selection
        const voiceType = this.voiceSelect.value;
        const availableVoices = this.voices.filter(voice => 
            voice.lang.includes('en')
        );
        
        if (availableVoices.length > 0) {
            if (voiceType === 'female') {
                utterance.voice = availableVoices.find(voice => voice.name.includes('Female')) || availableVoices[0];
            } else if (voiceType === 'male') {
                utterance.voice = availableVoices.find(voice => voice.name.includes('Male')) || availableVoices[0];
            } else {
                utterance.voice = availableVoices[0];
            }
        }

        utterance.rate = 0.9;
        utterance.pitch = voiceType === 'robotic' ? 0.5 : 1;
        utterance.volume = 1;

        this.synth.speak(utterance);
        this.playSound('response');
    }

    addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender.toLowerCase()}-message`;
        
        const timestamp = new Date().toLocaleTimeString();
        messageDiv.innerHTML = `
            <span class="timestamp">[${timestamp}]</span>
            <span class="text"><strong>${sender}:</strong> ${text}</span>
        `;
        
        this.commandHistory.appendChild(messageDiv);
        this.commandHistory.scrollTop = this.commandHistory.scrollHeight;
    }

    clearHistory() {
        this.commandHistory.innerHTML = '';
        this.addMessage('JARVIS', 'Log cleared. Ready for new commands.');
    }

    openSettings() {
        this.settingsModal.style.display = 'block';
    }

    closeSettings() {
        this.settingsModal.style.display = 'none';
    }

    changeVoice(voiceType) {
        this.addMessage('SYSTEM', `Voice changed to: ${voiceType}`);
    }

    changeTheme(theme) {
        const interfaceElement = document.querySelector('.jarvis-interface');
        interfaceElement.className = 'jarvis-interface';
        
        if (theme !== 'default') {
            interfaceElement.classList.add(`theme-${theme}`);
        }
        
        this.currentTheme = theme;
        this.addMessage('SYSTEM', `Interface theme changed to: ${theme}`);
    }

    updateTime() {
        const now = new Date();
        this.currentTime.textContent = `[${now.toLocaleTimeString()}]`;
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    playSound(type) {
        // In a real implementation, you would play actual sound files
        console.log(`Playing ${type} sound`);
    }

    updatePowerLevel() {
        // Simulate power level changes
        const level = 90 + Math.floor(Math.random() * 10);
        this.powerLevel.textContent = `${level}%`;
    }
}

// Initialize JARVIS when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const jarvis = new JarvisAssistant();
    
    // Simulate power level updates
    setInterval(() => jarvis.updatePowerLevel(), 5000);
});