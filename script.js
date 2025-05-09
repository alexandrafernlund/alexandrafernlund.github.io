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

    function getBotResponse(input) {
        const rawInput = input.trim().toLowerCase();

        let responseKey = matchIntent(rawInput);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

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

        responseKey = matchIntent(normalized);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        responseKey = matchByNounsAndVerbs(nouns, verbs);
        if (responseKey && responses[responseKey]) {
            return getRandomResponse(responses[responseKey].text, responseKey);
        }

        const fuzzy = getFuzzyResponse(rawInput);
        if (fuzzy) return fuzzy;

        return getRandomResponse(responses.unknown.text, "unknown");
    }

    function matchByNounsAndVerbs(nouns, verbs) {
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            if (nouns.some(noun => aliases.includes(noun)) || verbs.some(verb => aliases.includes(verb))) {
                return key;
            }
        }
        return null;
    }

    function getFuzzyResponse(input) {
        const fuzzyResults = fuse.search(input);
        if (fuzzyResults.length > 0 && fuzzyResults[0].score < 0.4) {
            const bestMatch = fuzzyResults[0];
            const bestMatchKey = bestMatch.item.key;
            return getRandomResponse(responses[bestMatchKey].text, bestMatchKey);
        }
        return null;
    }

    function generateHelpMessage() {
        let helpMessage = "Here are the available commands:\n\n";
        for (const key in responses) {
            const description = responses[key].description || "No description provided.";
            helpMessage += `• ${key}: ${description}\n`;
        }
        return helpMessage;
    }

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

    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';

            if (handleExitCommand(userMessage)) return;

            const botMessage = getBotResponse(userMessage);
            displayMessage(botMessage, 'bot');
        }
    });

    loadResponses();

    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
