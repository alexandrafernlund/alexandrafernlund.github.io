document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};

    // Toggle between terminal and GUI views
    function toggleView() {
        const terminal = document.getElementById('chat-terminal');
        const guiSite = document.getElementById('main-site');

        if (terminal && guiSite) {
            terminal.style.display = 'none';
            guiSite.style.display = 'block';
        }
    }

    // Load responses from JSON
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Loaded responses:", responses);
            displayWelcomeMessage();
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    // Welcome messages
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready.',
            "Hi! I'm Alexandra's bot.",
            "For a list of available commands, type 'help'",
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

    // Fuse.js setup
    let fuse;
    function initializeFuse() {
        let fuseCommands = Object.entries(responses).map(([key, value]) => ({
            key,
            aliases: value.aliases || [key]
        }));

        fuse = new Fuse(fuseCommands, {
            keys: ['aliases'],
            threshold: 0.4
        });
        console.log('Fuse.js initialized:', fuse);
    }

    // Match exact aliases
    function matchIntent(input) {
        input = input.trim().toLowerCase();
        for (const key in responses) {
            const aliases = responses[key].aliases || [key];
            if (aliases.some(alias => input === alias.trim().toLowerCase())) {
                return key;
            }
        }
        return null;
    }

    // Random response picker
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

    // Typing animation
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

    // Display message with typing effect
    function displayMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender, callback);
        scrollToBottom();
    }

    // Auto-scroll
    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    // Core logic to get bot response
    function getBotResponse(input) {
        console.log('User input:', input);
        input = input.toLowerCase().trim();

        // Exact match
        const responseKey = matchIntent(input);
        console.log('Matched responseKey:', responseKey);

        if (responseKey) {
            const responseText = getRandomResponse(responses[responseKey].text, responseKey);
            if (responseKey === 'goodbye' || responseKey === 'exit') {
                displayMessage(responseText, 'bot', () => {
                    toggleView();
                });
                return null;
            }
            return responseText;
        }

        if (responseKey === 'help') {
            let helpMessage = "Here are the available commands:\n\n";
            for (const key in responses) {
                const aliases = responses[key].aliases ? ` (aliases: ${responses[key].aliases.join(', ')})` : '';
                const description = Array.isArray(responses[key].text)
                    ? responses[key].text[0]
                    : responses[key].text;
                helpMessage += `• ${key}${aliases}: ${description}\n`;
            }
            return helpMessage;
        }        

        // Fuzzy match
        const results = fuse.search(input);
        if (results.length > 0) {
            const bestMatchKey = results[0].item.key;
            const responseText = getRandomResponse(responses[bestMatchKey].text, bestMatchKey);
            if (bestMatchKey === 'goodbye' || bestMatchKey === 'exit') {
                displayMessage(responseText, 'bot', () => {
                    toggleView();
                });
                return null;
            }
            return responseText;
        }

        return "I'm not sure how to respond to that.";
    }

    // Listen for Enter key
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            console.log('User message:', userMessage);
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';

            const botMessage = getBotResponse(userMessage);
            if (typeof botMessage === 'string') {
                displayMessage(botMessage, 'bot');
            }
        }
    });

    // Start bot
    loadResponses().then(() => {
        console.log("Responses loaded and ready.");
        initializeFuse();
    });

    // GUI toggle function (if used elsewhere)
    window.showTerminal = function () {
        document.getElementById('main-site').style.display = 'none';
        document.getElementById('chat-terminal').style.display = 'block';
    };
});
