class OfflineProcessor {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('nova-notes')) || [];
        this.timers = [];
        this.calculatorHistory = [];
    }

    processCommand(command) {
        console.log('Processing offline command:', command);
        
        // Convert command to lowercase for easier processing
        const lowerCommand = command.toLowerCase();
        
        // Greeting detection
        if (this.isGreeting(lowerCommand)) {
            return this.handleGreeting();
        }
        
        // Time queries
        if (this.isTimeQuery(lowerCommand)) {
            return this.handleTimeQuery();
        }
        
        // Date queries
        if (this.isDateQuery(lowerCommand)) {
            return this.handleDateQuery();
        }
        
        // Joke requests
        if (this.isJokeRequest(lowerCommand)) {
            return this.handleJokeRequest();
        }
        
        // Calculation requests
        if (this.isCalculation(lowerCommand)) {
            return this.handleCalculation(lowerCommand);
        }
        
        // Timer requests
        if (this.isTimerRequest(lowerCommand)) {
            return this.handleTimerRequest(lowerCommand);
        }
        
        // Note taking
        if (this.isNoteRequest(lowerCommand)) {
            return this.handleNoteRequest(lowerCommand);
        }
        
        // Weather (offline - generic response)
        if (this.isWeatherQuery(lowerCommand)) {
            return this.handleWeatherQuery();
        }
        
        // Default response
        return this.getDefaultResponse();
    }

    isGreeting(command) {
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greet => command.includes(greet));
    }

    isTimeQuery(command) {
        return command.includes('time') && !command.includes('timer');
    }

    isDateQuery(command) {
        return command.includes('date') || command.includes('today') || command.includes('day');
    }

    isJokeRequest(command) {
        return command.includes('joke') || command.includes('funny');
    }

    isCalculation(command) {
        const mathTerms = ['calculate', 'compute', 'what is', 'how much is', '+', '-', '*', '/', 'plus', 'minus', 'times', 'divided'];
        return mathTerms.some(term => command.includes(term));
    }

    isTimerRequest(command) {
        return command.includes('timer') || command.includes('alarm') || command.includes('remind');
    }

    isNoteRequest(command) {
        return command.includes('note') || command.includes('remember') || command.includes('write down');
    }

    isWeatherQuery(command) {
        return command.includes('weather') || command.includes('temperature') || command.includes('forecast');
    }

    handleGreeting() {
        const greetings = [
            "Hello! I'm NOVA, your offline AI assistant. How can I help you today?",
            "Hi there! I'm running completely offline and ready to assist you.",
            "Greetings! All my processing happens locally on your device - no internet required!",
            "Hello! I'm here to help you without needing any internet connection."
        ];
        return this.getRandomResponse(greetings);
    }

    handleTimeQuery() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        });
        
        return `The current time is ${timeString}.`;
    }

    handleDateQuery() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `Today is ${dateString}.`;
    }

    handleJokeRequest() {
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "Why did the scarecrow win an award? He was outstanding in his field!",
            "I told my computer I needed a break, and it said '404 - Break not found'!",
            "Why do programmers prefer dark mode? Because light attracts bugs!",
            "What do you call a fake noodle? An impasta!",
            "Why did the JavaScript developer wear glasses? Because he couldn't C#!",
            "I'm reading a book about anti-gravity. It's impossible to put down!",
            "Why don't skeletons fight each other? They don't have the guts!"
        ];
        return this.getRandomResponse(jokes);
    }

    handleCalculation(command) {
        try {
            // Extract numbers and operations
            const numbers = command.match(/\d+/g) || [];
            const operations = command.match(/plus|minus|times|divided|\+|\-|\*|\//g) || [];
            
            if (numbers.length < 2) {
                return "I need at least two numbers to perform a calculation. Try something like 'calculate 15 plus 7'.";
            }
            
            let result = parseFloat(numbers[0]);
            let explanation = `${numbers[0]}`;
            
            for (let i = 0; i < operations.length; i++) {
                const operation = operations[i];
                const nextNumber = parseFloat(numbers[i + 1]);
                
                switch(operation) {
                    case 'plus':
                    case '+':
                        result += nextNumber;
                        explanation += ` + ${nextNumber}`;
                        break;
                    case 'minus':
                    case '-':
                        result -= nextNumber;
                        explanation += ` - ${nextNumber}`;
                        break;
                    case 'times':
                    case '*':
                        result *= nextNumber;
                        explanation += ` × ${nextNumber}`;
                        break;
                    case 'divided':
                    case '/':
                        if (nextNumber === 0) return "I can't divide by zero!";
                        result /= nextNumber;
                        explanation += ` ÷ ${nextNumber}`;
                        break;
                }
            }
            
            explanation += ` = ${result}`;
            this.calculatorHistory.push(explanation);
            
            return `The calculation result is: ${result}. ${explanation}`;
            
        } catch (error) {
            return "I couldn't process that calculation. Please try something like 'calculate 10 plus 5'.";
        }
    }

    handleTimerRequest(command) {
        const timeMatch = command.match(/(\d+)\s*(minute|min|hour|hr|second|sec)/);
        
        if (!timeMatch) {
            return "Please specify a time duration. For example: 'set timer for 5 minutes'";
        }
        
        const amount = parseInt(timeMatch[1]);
        const unit = timeMatch[2];
        let milliseconds;
        
        switch(unit) {
            case 'minute':
            case 'min':
                milliseconds = amount * 60 * 1000;
                break;
            case 'hour':
            case 'hr':
                milliseconds = amount * 60 * 60 * 1000;
                break;
            case 'second':
            case 'sec':
                milliseconds = amount * 1000;
                break;
            default:
                milliseconds = amount * 60 * 1000;
        }
        
        const timerId = setTimeout(() => {
            this.notifyTimerComplete(amount, unit);
        }, milliseconds);
        
        this.timers.push({
            id: timerId,
            duration: `${amount} ${unit}`,
            endTime: Date.now() + milliseconds
        });
        
        return `Timer set for ${amount} ${unit}. I'll notify you when it's done.`;
    }

    handleNoteRequest(command) {
        const noteContent = command.replace(/note|remember|write down|take a note/gi, '').trim();
        
        if (!noteContent) {
            return "What would you like me to remember?";
        }
        
        this.notes.push({
            content: noteContent,
            timestamp: new Date().toISOString()
        });
        
        // Save to localStorage
        localStorage.setItem('nova-notes', JSON.stringify(this.notes));
        
        return `I've noted: "${noteContent}". I'll remember this for you.`;
    }

    handleWeatherQuery() {
        return "I'm currently operating in offline mode, so I can't access real-time weather data. However, you can check your device's built-in weather app or look outside your window!";
    }

    getDefaultResponse() {
        const responses = [
            "I'm not sure I understand. Could you try rephrasing that?",
            "That's an interesting request. I'm still learning offline commands!",
            "I don't have a specific response for that yet. Try asking about time, date, calculations, or jokes!",
            "As an offline assistant, my capabilities are limited to local processing. Try a different command!"
        ];
        return this.getRandomResponse(responses);
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    notifyTimerComplete(amount, unit) {
        // This would trigger a visual/audio notification
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Timer complete! Your timer for ${amount} ${unit} has finished.`);
            speechSynthesis.speak(utterance);
        }
        
        // Show visual notification
        if (Notification.permission === 'granted') {
            new Notification('NOVA Timer', {
                body: `Your ${amount} ${unit} timer is complete!`,
                icon: '/assets/icon.png'
            });
        }
    }

    // Get all notes
    getNotes() {
        return this.notes;
    }

    // Clear all notes
    clearNotes() {
        this.notes = [];
        localStorage.removeItem('nova-notes');
    }
}