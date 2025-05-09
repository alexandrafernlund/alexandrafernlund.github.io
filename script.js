document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};
    let fuse;
    let isBotTyping = false; // Prevent typing before finishing current message

    // A function to toggle between terminal and the GUI view
    function toggleView() {
        const terminal = document.getElementById('chat-terminal');
        const guiSite = document.getElementById('main-site');
        if (terminal && guiSite) {
            terminal.style.display = 'none';
            guiSite.style.display = 'block';
        }
    }

    // Load the response data asynchronously
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            if (!response.ok) {
                throw new Error('Failed to load responses.json');
            }
            responses = await response.json();
            initializeFuse();
            displayWelcomeMessage();
        } catch (error) {
            console.error("Error loading responses.json:", error);
        }
    }

    // Display the welcome message after loading responses
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

    // Initialize Fuse for fuzzy searching commands
    function initializeFuse() {
        const fuseCommands = [];
        for (const [key, value] of Object.entries(responses)) {
            const aliases = value.aliases || [];
            for (const alias of aliases) {
                fuseCommands.push({
                    key: key,
                    alias: alias.toLowerCase()
                });
            }
        }
        fuse = new Fuse(fuseCommands, {
            keys: ['alias', 'key'],
            threshold: 0.4,
            distance: 200,
            includeScore: true
        });
    }

    // Matching input with predefined intents
    function matchIntent(input) {
        input = input.trim().toLowerCase();
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            for (const alias of aliases) {
                const aliasLower = alias.toLowerCase();
                if (input === aliasLower) {
                    return key; // exact match
                }
                if (input.includes(aliasLower) || aliasLower.includes(input)) {
                    return key; // partial/contained match
                }
            }
        }
        return null;
    }

    // Get a random response
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

    // Function to type messages out with a delay
    function typeMessage(message, sender, callback) {
        if (isBotTyping) return; // Prevent typing if bot is already typing

        isBotTyping = true; // Set flag when typing begins
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);

        let index = 0;
        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                setTimeout(typeNextChar, Math.random() * 100 + 50);
            } else {
                isBotTyping = false; // Reset flag when typing finishes
                if (callback) callback();
            }
        }

        typeNextChar();
    }

    // Display the message in the output
    function displayMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender, callback);
        scrollToBottom();
    }

    // Scroll to the bottom of the output for the latest message
    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    // Get the bot's response based on the input
    function getBotResponse(input) {
        const rawInput = input.trim().toLowerCase();

        // Attempt to match intent directly
        let responseKey = matchIntent(rawInput);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        // Try NLP parsing (fallback)
        let normalized, nouns = [], verbs = [], isQuestion = false;
        try {
            const doc = nlp(input);
            normalized = doc.normalize().out('text').toLowerCase();
            nouns = doc.nouns().out('array').map(n => n.toLowerCase());
            verbs = doc.verbs().out('array').map(v => v.toLowerCase());
            isQuestion = doc.questions().length > 0;
        } catch (err) {
            console.warn("NLP error:", err);
        }

        // Attempt to match again after NLP processing
        responseKey = matchIntent(normalized);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        // Try to match by nouns/verbs
        responseKey = matchByNounsAndVerbs(nouns, verbs);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        // Fallback to fuzzy search if needed
        const fuzzy = getFuzzyResponse(rawInput);
        if (fuzzy) return fuzzy;

        return getRandomResponse(responses.unknown.text, "unknown");
    }

    // Match based on noun/verb presence
    function matchByNounsAndVerbs(nouns, verbs) {
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            if (nouns.some(noun => aliases.includes(noun)) || verbs.some(verb => aliases.includes(verb))) {
                return key;
            }
        }
        return null;
    }

    // Fuzzy search response
    function getFuzzyResponse(input) {
        if (!fuse) return null;  // Ensure fuse is initialized
        const fuzzyResults = fuse.search(input);
        if (fuzzyResults.length > 0 && fuzzyResults[0].score < 0.4) {
            const bestMatch = fuzzyResults[0];
            const bestMatchKey = bestMatch.item.key;
            return getRandomResponse(responses[bestMatchKey].text, bestMatchKey);
        }
        return null;
    }

    // Handle "help" command for list of available commands
    function generateHelpMessage() {
        let helpMessage = "Here are the available commands:\n\n";
        for (const key in responses) {
            const description = responses[key].description || "No description provided.";
            helpMessage += `• ${key}: ${description}\n`;
        }
        return helpMessage;
    }

    // Handle the "exit" command
    function handleExitCommand(input) {
        const exitAliases = responses['goodbye']?.aliases.map(a => a.toLowerCase()) || [];
        const normalizedInput = input.toLowerCase().trim();

        if (exitAliases.some(alias => normalizedInput === alias || normalizedInput.includes(alias))) {
            displayMessage("Exiting terminal and returning to GUI...", 'bot', () => {
                toggleView();
            });
            return true;
        }
        return false;
    }

    // Event listener for user input
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            if (isBotTyping) return; // Prevent input while bot is typing

            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';

            if (handleExitCommand(userMessage)) return;

            const botMessage = getBotResponse(userMessage);
            displayMessage(botMessage, 'bot');
        }
    });

    // Initialize the bot when the page is ready
    loadResponses();

    // Show the terminal view
    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
