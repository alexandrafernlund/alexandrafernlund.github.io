document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {}; // Empty at first, loads later

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

    // Function to display messages
    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender); // Add class for styling (e.g., 'user' or 'bot')
        div.textContent = message;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
    }


    // Welcome message animation
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready. Type a question to start interacting!',
            'You can ask about my projects, technical skills, or any personal questions you are curious about.'
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

    function getBotResponse(input) {
        input = input.toLowerCase();

        if (Object.keys(responses).length === 0) {
            return "Responses are still loading... Please try again in a moment.";
        }

        for (let pattern in responses) {
            let regex = new RegExp(pattern, "i"); // Convert JSON keys into regex
            if (regex.test(input)) {
                return responses[pattern]; // Return the matching response
            }
        }

        return "I didn't understand that. Try asking about my portfolio or projects.";
    }


    // Handle user input (Wait for JSON to load)
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userName = userInput.value.trim();
            userInput.value = ''; // Clear input
            userContext.name = userName; // Store the name for future reference
            displayMessage(`Nice to meet you, ${userName}!`, 'bot');
            displayMessage("What can I help you with today?", 'bot');

            const userMessage = userInput.value;
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = ''; // Clear input immediately

            // Show typing indicator
            const typingIndicator = displayBotTyping();

            // Simulate delay, then show actual bot message
            setTimeout(() => {
                typingIndicator.remove(); // Remove typing block
                const botMessage = getBotResponse(userMessage);
                typeBotMessage(botMessage);
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
