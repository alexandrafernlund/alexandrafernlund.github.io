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

        if (input === 'play snake') {
            if (!window.gameActive && typeof startGame === 'function') {
                startGame();
                return "Starting Snake game! Use arrow keys to play.";
            } else {
                return "Snake game is already running.";
            }
        }

        window.addEventListener('snakeGameOver', (e) => {
            displayMessage(e.detail, 'bot');  // Assuming displayMessage is your function to add text to terminal
        });

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

            if (userMessage.toLowerCase() === 'exit') {
                displayMessage("Exiting terminal and returning to GUI...", 'bot', () => {
                    toggleView();
                });
                return;
            }

            const botMessage = getBotResponse(userMessage);

            if (typeof botMessage === 'string') {
                displayMessage(botMessage, 'bot', () => {
                    const exitAliases = responses['goodbye']?.aliases || [];
                    const normalizedInput = userMessage.toLowerCase().trim();

                    if (
                        matchIntent(normalizedInput) === 'goodbye' ||
                        exitAliases.some(alias => normalizedInput.includes(alias))
                    ) {
                        setTimeout(() => toggleView(), 1500);
                    }
                });
            }
        }
    });

    loadResponses();

    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
