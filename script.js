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

    // Noun/verb match
    function matchByNounsAndVerbs(nouns, verbs) {
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            if (
                nouns.some(noun => aliases.includes(noun.toLowerCase())) ||
                verbs.some(verb => aliases.includes(verb.toLowerCase()))
            ) {
                return key;
            }
        }
        return null;
    }

    // Fuzzy fallback
    function getFuzzyResponse(input) {
        const fuzzyResults = fuse.search(input);
        if (fuzzyResults.length > 0 && fuzzyResults[0].score < 0.4) {
            const bestMatch = fuzzyResults[0];
            const bestMatchKey = bestMatch.item.key;
            return getRandomResponse(responses[bestMatchKey].text, bestMatchKey);
        }
        return null;
    }

    // Get random (non-repeating) response
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

    // Display message with typewriter effect
    function typeMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        let index = 0;
        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                setTimeout(typeNextChar, Math.random() * 50 + 20);
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

    // Generate bot response
    function getBotResponse(input) {
        const cleanedInput = input.toLowerCase().trim();

        // Handle exit
        const exitAliases = responses['goodbye']?.aliases?.map(a => a.toLowerCase()) || [];
        if (exitAliases.some(alias => cleanedInput === alias || cleanedInput.includes(alias))) {
            displayMessage("Exiting terminal and returning to GUI...", 'bot', () => {
                toggleView();
            });
            return;
        }

        // NLP handling
        let normalized, verbs = [], nouns = [], isQuestion = false;
        try {
            const doc = nlp(input);
            normalized = doc.normalize().out('text');
            verbs = doc.verbs().out('array');
            nouns = doc.nouns().out('array');
            isQuestion = doc.questions().length > 0;
        } catch (err) {
            console.warn("NLP error:", err);
            normalized = input;
        }

        // Match in order
        let responseKey = matchIntent(normalized)
            || matchIntent(cleanedInput)
            || matchByNounsAndVerbs(nouns, verbs);

        // Fuzzy fallback
        if (!responseKey) {
            const fuzzy = getFuzzyResponse(normalized);
            if (fuzzy) return fuzzy;
        }

        // Final response
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        return "I'm not sure how to respond to that.";
    }

    // Listen for Enter key
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';

            const botMessage = getBotResponse(userMessage);
            if (botMessage) {
                displayMessage(botMessage, 'bot');
            }
        }
    });

    // Start
    loadResponses();

    // External toggle
    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
