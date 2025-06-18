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
                scrollToBottom(); 
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

    // Use compromise.js to dynamically match against JSON alias lists
    function matchIntentFromDoc(doc, responses) {
    for (const key in responses) {
        const entry = responses[key];
        const aliases = entry.aliases || [];

        for (const alias of aliases) {
            // Check if the document contains the full alias as a phrase
            if (doc.has(alias) || doc.match(alias).found) {
                return key;
            }
        }
    }
    return null;
    }

    // Generate response
    function getBotResponse(input) {
        const cleanedInput = input.toLowerCase().trim();
        let doc, normalized, verbs, nouns;

        try {
            doc = nlp(cleanedInput);
            normalized = doc.normalize().out('text');
            verbs = doc.verbs().out('array');
            nouns = doc.nouns().out('array');
        } catch (err) {
            console.error("NLP error:", err);
            normalized = cleanedInput;
            verbs = nouns = [];
        }

        // Try matching by NLP alias first
        let responseKey = matchIntentFromDoc(doc, responses);

        // Fallback: exact match
        if (!responseKey) {
            responseKey = matchIntent(normalized) || matchIntent(cleanedInput);
        }

        // Fallback: simple keyword in nouns/verbs
        if (!responseKey) {
            for (const key in responses) {
                const aliases = responses[key].aliases || [key];
                if (nouns.some(noun => aliases.includes(noun)) || verbs.some(verb => aliases.includes(verb))) {
                    responseKey = key;
                    break;
                }
            }
        }

        // Fuzzy match
        const fuzzyResults = fuse.search(cleanedInput);
        const fuzzyKey = fuzzyResults[0]?.item.key;

        // Help special case
        if (responseKey === 'help' || fuzzyKey === 'help') {
            let helpMessage = "Here are the available commands:\n\n";
            for (const key in responses) {
                const description = responses[key].description || "No description provided.";
                helpMessage += `• ${key}: ${description}\n`;
            }
            return helpMessage;
        }

        // Final response decision
        if (!responseKey && fuzzyResults.length > 0) {
            return getRandomResponse(responses[fuzzyKey].text, fuzzyKey);
        }

        return responseKey
            ? getRandomResponse(responses[responseKey].text, responseKey)
            : "I'm not sure how to respond to that.";
    }
    
    // Listen for Enter key
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';
    
            // Exit command check goes here:
            if (userMessage.toLowerCase() === 'exit') {
                displayMessage("Exiting terminal and returning to GUI...", 'bot', () => {
                    toggleView(); // this calls your existing toggle function
                });
                return; // stop further processing
            }
    
            const botMessage = getBotResponse(userMessage);

            if (typeof botMessage === 'string') {
                displayMessage(botMessage, 'bot', () => {
                    const exitAliases = responses['goodbye']?.aliases || [];
                    const normalizedInput = userMessage.toLowerCase().trim();
                    
                    // Check for exact alias match or response key === 'goodbye'
                    if (
                        matchIntent(normalizedInput) === 'goodbye' ||
                        exitAliases.some(alias => normalizedInput.includes(alias))
                    ) {
                        setTimeout(() => toggleView(), 1500); // Delay for natural UX
                    }
                });
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