document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {}; // Empty at first, loads later
    let userContext = {}; // Initialize userContext object to store user information like name

    // Load responses.json BEFORE allowing input
    async function loadResponses() {
        try {
            console.log("Loading responses...");
            const response = await fetch('responses.json'); // Make sure the path is correct
            responses = await response.json();
            console.log("Bot responses loaded successfully.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {}; // Ensure it's still an object in case of error
        }
    }

    // Function to display messages
    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender); // Add class for styling (e.g., 'user' or 'bot')
        div.textContent = message;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
    }

    // Function to type the bot's message
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

                // Random delay between 20ms and 80ms
                const delay = Math.floor(Math.random() * 60) + 20;
                setTimeout(typeNextChar, delay);
            }
        }

        typeNextChar();
    }

    // Welcome message animation
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready.',
            "Hi! I'm Alexandra's bot.",
            "You can ask me about her projects, technical skills, or any personal questions you're' curious about."
        ];
        let index = 0;

        function showNextMessage() {
            if (index < messages.length) {
                displayMessage(messages[index], 'bot');
                index++;
                setTimeout(showNextMessage, 800); // Delayed typing effect
            }
        }

        showNextMessage();
    }

    // Get bot response based on user input
    function getBotResponse(input) {
        input = input.toLowerCase();

        if (Object.keys(responses).length === 0) {
            return "Responses are still loading... Please try again in a moment.";
        }

        // If the user is asking for your name
        if (/what('?s| is) your name\??/.test(input)) {
            userContext.awaitingName = true; // Flag to capture their next input
            return "I'm Alexandra's bot. What's your name?";
        }

        // If we're expecting the user's name
        if (userContext.awaitingName) {
            userContext.name = input.charAt(0).toUpperCase() + input.slice(1); // Store nicely formatted name
            userContext.awaitingName = false;
            return `Nice to meet you, ${userContext.name}! Let me know if you want to hear about my work or projects.`;
        }

        // Fallback to checking responses.json patterns
        for (let pattern in responses) {
            let regex = new RegExp(pattern, "i");
            let match = input.match(regex);
            if (match) {
                let response = responses[pattern];

                // Inject captured group (e.g., Jim for name)
                let message = response.text.replace(/\$(\d+)/g, (_, i) => match[i] || "");

                // Replace {{name}} with the actual user's name
                message = message.replace("{{name}}", userContext.name || "friend");

                // Additional logic to handle storing user's name if required
                if (response.setAwaitingName) {
                    userContext.awaitingName = true;
                }

                if (response.saveName && match[1]) {
                    userContext.name = match[1].charAt(0).toUpperCase() + match[1].slice(1);
                }

                return message;
            }
        }

        return "I didn't understand that. I must have a bug in my code... Damn.";
    }

    // Handle user input
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();

            // Otherwise, display user message and show bot response
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = ''; // Clear input immediately after capturing

            // Show typing indicator
            const typingIndicator = displayBotTyping();

            // Simulate delay, then show actual bot message
            setTimeout(() => {
                typingIndicator.remove(); // Remove typing block
                const botMessage = getBotResponse(userMessage);
                typeBotMessage(botMessage); // Display bot message
            }, 800); // Adjust delay as you like
        }
    });

    function displayBotTyping() {
        const typing = document.createElement('div');
        typing.classList.add('bot', 'typing');
        typing.textContent = '|'; // Terminal-style cursor
        output.appendChild(typing);
        output.scrollTop = output.scrollHeight;
        return typing;
    }

    // Run functions on page load
    displayWelcomeMessage();
    loadResponses().then(() => {
        console.log("Responses are ready to be used.");
    });
});
