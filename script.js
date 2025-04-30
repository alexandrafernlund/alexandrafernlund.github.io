document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};

    // Load responses from JSON
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            displayWelcomeMessage(); // Ensure welcome messages are displayed once responses are loaded
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    // Function to display welcome messages when the terminal is initialized
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
                setTimeout(showNextMessage, 800); // Wait before showing next message
            }
        }

        showNextMessage();
    }

    // Initialize compromise NLP library
    const nlp = window.nlp;

    // Fuse.js setup for fuzzy searching (this will help with spelling mistakes)
    let fuse;
    function initializeFuse() {
        let fuseCommands = Object.keys(responses).map(cmd => ({
            key: cmd,
            aliases: [cmd] // You can add more aliases here if you like
        }));

        fuse = new Fuse(fuseCommands, {
            keys: ['aliases'],
            threshold: 0.3 // Low threshold for fuzzy matching
        });
    }

    // Function to process user input and get the best matching response
    function getBotResponse(input) {
        input = input.toLowerCase().trim();

        // Use compromise to process the input and detect intents
        let doc = nlp(input);

        // Check if the input is related to humor or asking for a joke
        if (doc.has('funny') || doc.has('laugh') || doc.has('humor') || doc.has('joke') || input.includes('be funny')) {
            return getRandomResponse(responses.joke.text, "fun");
        }

        if (doc.has('name') || doc.has('who are you')) {
            return getRandomResponse(responses["what's your name?"].text, "general");
        }

        if (doc.has('exit') || doc.has('goodbye')) {
            return getRandomResponse(responses.goodbye.text, "general");
        }

        if (doc.has('help')) {
            return getRandomResponse(responses.help.text, "commands");
        }

        // Fuzzy search for best match if NLP didn't detect a clear intent
        const results = fuse.search(input);
        if (results.length > 0) {
            const bestMatchKey = results[0].item.key;
            const response = responses[bestMatchKey] || responses["unknown"];
            return getRandomResponse(response.text, bestMatchKey);
        }

        // Fallback to unknown if no match found
        return getRandomResponse(responses.unknown.text, "unknown");
    }

    // Get a random response from an array or return the text if not an array
    function getRandomResponse(response, category = "general") {
        if (Array.isArray(response)) {
            let randomResponse;
            do {
                randomResponse = response[Math.floor(Math.random() * response.length)];
            } while (randomResponse === lastResponseByCategory[category]); // Avoid repeating last response

            lastResponseByCategory[category] = randomResponse;
            return randomResponse;
        }
        return response; // Return as-is if it's not an array
    }

    // Function to display messages (simulate typing effect)
    function typeMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        let index = 0;

        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                setTimeout(typeNextChar, Math.random() * 100 + 50);
            }
        }

        typeNextChar();
    }

    // Function to display messages
    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender);
    }

    // Event listener for user input
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';  // Clear input field

            const botMessage = getBotResponse(userMessage);
            displayMessage(botMessage, 'bot');
        }
    });

    // Load responses and initialize the chatbot
    loadResponses().then(() => {
        console.log("Responses loaded and ready.");
        initializeFuse();  // Initialize Fuse.js after responses are loaded
    });
});
