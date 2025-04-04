document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    const heroTitle = document.getElementById('hero-title');
    let responses = {};
    let userContext = {};

    // Global function to show the terminal and hide the site
    window.showTerminal = function () {
        document.getElementById('chat-terminal').style.display = 'block';
        document.getElementById('main-site').style.display = 'none';
    };

    // Global function to show the main site and hide the terminal
    window.showMainSite = function () {
        document.getElementById('chat-terminal').style.display = 'none';
        document.getElementById('main-site').style.display = 'block';
    };

    async function loadResponses() {
        try {
            console.log("Loading responses...");
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Bot responses loaded successfully.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        div.textContent = message;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;
    }

    // Typing animation for bot messages
    function typeBotMessage(message) {
        const div = document.createElement('div');
        div.classList.add('bot');
        output.appendChild(div);
        output.scrollTop = output.scrollHeight;

        let index = 0;

        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                const delay = Math.floor(Math.random() * 60) + 20;
                setTimeout(typeNextChar, delay);
            }
        }

        typeNextChar();
    }

    // Typing animation for the hero title (h1)
    function typeHeroTitle(text) {
        let index = 0;

        function typeNextChar() {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                const delay = Math.floor(Math.random() * 60) + 20; // Same delay as bot messages
                setTimeout(typeNextChar, delay);
            }
        }

        typeNextChar();
    }

    // Display the welcome message in the terminal
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready.',
            "Hi! I'm Alexandra's bot.",
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

    function getBotResponse(input) {
        input = input.toLowerCase();

        if (input === "exit terminal") {
            showMainSite();
            return "Exiting terminal... Welcome to the main site!";
        }

        if (Object.keys(responses).length === 0) {
            return "Responses are still loading... Please try again in a moment.";
        }

        const greetingPatterns = [/hi\b/, /hello\b/, /hey\b/, /greetings\b/];
        for (let pattern of greetingPatterns) {
            if (pattern.test(input)) {
                return responses.greeting.text;
            }
        }

        if (/what('?s| is) your name\??/.test(input)) {
            userContext.awaitingName = true;
            return responses.name.text;
        }

        if (userContext.awaitingName) {
            userContext.name = input.charAt(0).toUpperCase() + input.slice(1);
            userContext.awaitingName = false;
            return `Nice to meet you, ${userContext.name}! Let me know if you want to hear about Alexandra's work or projects.`;
        }

        const keywords = ['projects', 'portfolio', 'skills', 'work'];
        for (let keyword of keywords) {
            if (input.includes(keyword)) {
                const response = responses[keyword] || responses["unknown"];
                return response.text.replace("{{name}}", userContext.name || "friend");
            }
        }

        return responses.unknown.text;
    }

    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();

            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';

            const typingIndicator = displayBotTyping();

            setTimeout(() => {
                typingIndicator.remove();
                const botMessage = getBotResponse(userMessage);
                typeBotMessage(botMessage);
            }, 800);
        }
    });

    // Typing animation for bot typing indicator
    function displayBotTyping() {
        const typing = document.createElement('div');
        typing.classList.add('bot', 'typing');
        typing.textContent = '|';
        output.appendChild(typing);
        output.scrollTop = output.scrollHeight;
        return typing;
    }

    // Initialize typing animation for the hero title
    if (heroTitle) {
        typeHeroTitle('Welcome to Alexandra\'s Portfolio');
    }

    displayWelcomeMessage();
    loadResponses().then(() => {
        console.log("Responses are ready to be used.");
    });
});
