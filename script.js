document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    userInput.focus();
    const output = document.getElementById('output');
    let responses = {};
    let fuse;

    // Global function to show the terminal and hide the site
    window.showTerminal = function () {
        document.getElementById('chat-terminal').style.display = 'block';
        document.getElementById('main-site').style.display = 'none';
        userInput.focus();
    };

    // Global function to show the main site and hide the terminal
    window.showMainSite = function () {
        document.getElementById('chat-terminal').style.display = 'none';
        document.getElementById('main-site').style.display = 'block';
    };

    // Load responses and initialize Fuse
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();

            // Prepare Fuse index with keys and aliases
            const fuseCommands = Object.keys(responses).map(cmd => ({
                key: cmd,
                aliases: responses[cmd].aliases || [cmd] // Add aliases here
            }));

            // Initialize Fuse with fuseCommands (contains both keys and aliases)
            fuse = new Fuse(fuseCommands, {
                keys: ['aliases'], // Searching within aliases
                threshold: 0.3 // Adjust threshold for fuzziness
            });

            console.log("Bot responses loaded and Fuse initialized.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    // Function to display message (character by character)
    function typeMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        scrollToBottom(); // Initial scroll for empty container

        let index = 0;

        function typeNextChar() {
            if (index < message.length) {
                div.textContent += message.charAt(index);
                index++;
                scrollToBottom(); // Scroll as it types
                const delay = Math.floor(Math.random() * 60) + 20;
                setTimeout(typeNextChar, delay);
            }
        }

        typeNextChar();
    }

    // Function to display message in output container
    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        scrollToBottom(); // Ensure scroll before typing starts
        typeMessage(message, sender);
    }

    // Display welcome message when the terminal is initialized
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

    // Remember the last response to not give the same one
    let lastResponseByCategory = {};

    function getRandomResponse(response, category = "general") {
        if (Array.isArray(response)) {
            let newResponse;

            // Keep trying until we get a new one (or max 10 tries)
            for (let i = 0; i < 10; i++) {
                newResponse = response[Math.floor(Math.random() * response.length)];
                if (newResponse !== lastResponseByCategory[category]) {
                    break;
                }
            }

            lastResponseByCategory[category] = newResponse;
            return newResponse;
        }

        return response; // If it's not an array, return as-is
    }

    function getBotResponse(input) {
        input = input.toLowerCase().trim();

        // Handle exit commands
        if (input === "exit terminal" || input === "exit") {
            showMainSite(); // Hides terminal, shows main site
            return "Exiting terminal... Welcome back to the main site!";
        }

        if (Object.keys(responses).length === 0) {
            return "Responses are still loading... Please try again in a moment.";
        }

        // Use Fuse.js to search for the best fuzzy match
        const results = fuse.search(input);
        if (results.length > 0) {
            // Get the best match based on Fuse.js score (lowest score is the best match)
            const bestMatchKey = results[0].item.key;
            const response = responses[bestMatchKey] || responses["unknown"];
            return getRandomResponse(response.text, bestMatchKey);
        }

        // If no match found, fall back to unknown
        return getRandomResponse(responses.unknown.text, "unknown");
    }

    // Event listener for user input
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();

            // Display user message
            displayMessage(`> ${userMessage}`, 'user');

            // Clear the input field
            userInput.value = '';

            // Show typing indicator
            const typingIndicator = displayBotTyping();

            setTimeout(() => {
                typingIndicator.remove();

                // Get bot's response
                const botMessage = getBotResponse(userMessage);

                // If bot message exists, display it
                if (botMessage) {
                    displayMessage(botMessage, 'bot');
                }
            }, 800); // Simulate typing delay
        }
    });

    // Display bot typing indicator
    function displayBotTyping() {
        const typing = document.createElement('div');
        typing.classList.add('bot', 'typing');
        typing.textContent = '|';
        output.appendChild(typing);
        scrollToBottom();
        return typing;
    }

    displayWelcomeMessage();
    loadResponses().then(() => {
        console.log("Responses are ready to be used.");
    });

    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }
});
