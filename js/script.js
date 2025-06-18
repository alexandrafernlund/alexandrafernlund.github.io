document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};
    let fuse;

    function toggleView() {
        const terminal = document.getElementById('chat-terminal');
        const guiSite = document.getElementById('main-site');
        if (terminal && guiSite) {
            terminal.style.display = 'none';
            guiSite.style.display = 'block';
        }
    }

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

    function typeMessage(message, div, callback) {
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
    div.classList.add(sender); // 'user' or 'bot'
    output.appendChild(div);
    typeMessage(message, div, callback);
    scrollToBottom();
}

    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    function matchIntentFromDoc(doc, responses) {
        for (const key in responses) {
            const entry = responses[key];
            const aliases = entry.aliases || [];
            for (const alias of aliases) {
                if (doc.has(alias) || doc.match(alias).found) {
                    return key;
                }
            }
        }
        return null;
    }

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

        let responseKey = matchIntentFromDoc(doc, responses);

        if (!responseKey) {
            responseKey = matchIntent(normalized) || matchIntent(cleanedInput);
        }

        if (!responseKey) {
            for (const key in responses) {
                const aliases = responses[key].aliases || [key];
                if (nouns.some(noun => aliases.includes(noun)) || verbs.some(verb => aliases.includes(verb))) {
                    responseKey = key;
                    break;
                }
            }
        }

        const fuzzyResults = fuse.search(cleanedInput);
        const fuzzyKey = fuzzyResults[0]?.item.key;

        if (responseKey === 'help' || fuzzyKey === 'help') {
            let helpMessage = "Here are the available commands:\n\n";
            for (const key in responses) {
                const description = responses[key].description || "No description provided.";
                helpMessage += `• ${key}: ${description}\n`;
            }
            return helpMessage;
        }

        if (!responseKey && fuzzyResults.length > 0) {
            return getRandomResponse(responses[fuzzyKey].text, fuzzyKey);
        }

        return responseKey
            ? getRandomResponse(responses[responseKey].text, responseKey)
            : "I'm not sure how to respond to that.";
    }

    userInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && userInput.value.trim() !== '') {
        const userMessage = userInput.value.trim();
        displayMessage(`> ${userMessage}`, 'user');
        userInput.value = '';

        const normalizedInput = userMessage.toLowerCase().trim();
        const intent = matchIntent(normalizedInput);
        const exitAliases = responses['goodbye']?.aliases || [];

        // 🎯 Special case: Exit command
        if (normalizedInput === 'exit' || intent === 'goodbye' || exitAliases.some(alias => normalizedInput.includes(alias))) {
            displayMessage("Exiting terminal and returning to GUI...", 'bot', () => {
                setTimeout(() => toggleView(), 1500);
            });
            return;
        }

        // 🎯 Special case: Chess command
        if (
            ['play chess', 'start chess', 'chess'].includes(normalizedInput) ||
            intent === 'chess'
        ) {
            displayMessage("Opening the chess board...", 'bot');
            if (typeof window.toggleChess === 'function') {
                window.toggleChess();
            }
            if (typeof window.resetChessGame === 'function') {
                window.resetChessGame();
            }
            return;
        }

        // 🧠 Default bot response
        const botMessage = getBotResponse(userMessage);

        if (typeof botMessage === 'string') {
            displayMessage(botMessage, 'bot');
        }
    }
});

    loadResponses();

    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
