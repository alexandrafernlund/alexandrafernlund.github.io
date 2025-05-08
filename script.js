document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};
    let fuse;

    // Toggle between terminal and GUI views
    function toggleView() {
        const terminal = document.getElementById('chat-terminal');
        const guiSite = document.getElementById('main-site');

        if (terminal && guiSite) {
            terminal.style.display = 'none';
            guiSite.style.display = 'block';
        }
    }    

    // Load responses
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Loaded responses:", responses);
            initializeFuse();
            displayWelcomeMessage();
        } catch (error) {
            console.error("Error loading responses.json:", error);
        }
    }

    // Welcome messages
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready.',
            "Hi! I'm Alexandra's bot.",
            "For a list of available commands, type 'help'.",
            "You can ask me about her projects, technical skills, or any personal questions you're curious about."
        ];
        let index = 0;
        function showNextMessage() {
            if (index < messages.length) {
                displayMessage(messages[index], 'bot');
                index++;
                setTimeout(showNextMessage, 800);
            }
        }
        showNextMessage();
    }

    // Fuse.js fuzzy matching setup
    function initializeFuse() {
        const fuseCommands = Object.entries(responses).map(([key, value]) => ({
            key,
            aliases: value.aliases || [key]
        }));
        fuse = new Fuse(fuseCommands, {
            keys: ['aliases'],
            threshold: 0.4
        });
    }

    // Exact alias match
    function matchIntent(input) {
        input = input.trim().toLowerCase();
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            if (aliases.some(alias => input === alias.toLowerCase())) {
                return key;
            }
        }
        return null;
    }

    // Random response with repeat protection
    function getRandomResponse(response, category = "general") {
        if (Array.isArray(response)) {
            let randomResponse;
            do {
                randomResponse = response[Math.floor(Math.random() * response.length)];
            } while (randomResponse === lastResponseByCategory[category]);
            lastResponseByCategory[category] = randomResponse;
            return randomResponse;
        }
        return response;
    }

    // Typewriter effect
    function typeMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        let index = 0;
        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                setTimeout(typeNextChar, Math.random() * 100 + 50);
            } else if (callback) {
                callback();
            }
        }
        typeNextChar();
    }

    function displayMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender, callback);
        scrollToBottom();
    }

    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    // Generate response
    function getBotResponse(input) {
        const cleanedInput = input.toLowerCase().trim();

        // Apply NLP to input
        let normalized, verbs, nouns, isQuestion;
        try {
            const doc = nlp(input);
            normalized = doc.normalize().out('text');
            verbs = doc.verbs().out('array');
            nouns = doc.nouns().out('array');
            isQuestion = doc.questions().length > 0;
        } catch (err) {
            console.error("NLP error:", err);
            normalized = input;
            verbs = nouns = [];
            isQuestion = false;
        }

        console.log("NLP output:", {
            normalized,
            verbs,
            nouns,
            isQuestion
        });        

        // Try matching using normalized input, fall back to cleaned input
        let responseKey = matchIntent(normalized);
        if (!responseKey) {
            responseKey = matchIntent(cleanedInput);
        }
        console.log('Matched responseKey:', responseKey);

        // Fuzzy results (used for help fallback or when no exact match found)
        const fuzzyResults = fuse.search(cleanedInput);
        const fuzzyKey = fuzzyResults[0]?.item.key;

        // Special case: help command (exact or fuzzy)
        if (responseKey === 'help' || fuzzyKey === 'help') {
            let helpMessage = "Here are the available commands:\n\n";
            for (const key in responses) {
                const description = responses[key].description || "No description provided.";
                helpMessage += `• ${key}: ${description}\n`;
            }
            return helpMessage;
        }

        // Handle exit or goodbye
        if (responseKey === 'goodbye' || responseKey === 'exit') {
            const responseText = getRandomResponse(responses[responseKey].text, responseKey);
            displayMessage(responseText, 'bot', () => {
                // After the exit message, switch to the GUI
                toggleView();  // Hide the terminal, show the GUI
            });
            return null;
        }

        // If exact match found
        if (responseKey) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        // Fuzzy fallback
        if (fuzzyResults.length > 0) {
            const bestMatchKey = fuzzyResults[0].item.key;
            const responseText = getRandomResponse(responses[bestMatchKey].text, bestMatchKey);

            if (bestMatchKey === 'goodbye' || bestMatchKey === 'exit') {
                displayMessage(responseText, 'bot', () => toggleView());
                return null;
            }

            return responseText;
        }

        // Default response if no match found
        return "I'm not sure how to respond to that.";
    }

    // Listen for Enter key
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';
            const botMessage = getBotResponse(userMessage);
            if (typeof botMessage === 'string') {
                displayMessage(botMessage, 'bot');
            }
        }
    });

    // Start bot
    loadResponses();

    // Global GUI toggle
    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
