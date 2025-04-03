document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {}; // Empty at first, loads later

    // Load responses.json BEFORE allowing input
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Bot responses loaded successfully.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {}; // Ensure it's still an object
        }
    }

    // Function to display messages
    function displayMessage(message, sender) {
        const div = document.createElement('div');
        div.classList.add(sender);
        div.textContent = message;
        output.appendChild(div);
        output.scrollTop = output.scrollHeight; // Auto-scroll to bottom
    }

    // Welcome message animation
    function displayWelcomeMessage() {
        const messages = [
            'Initializing terminal...',
            'Loading portfolio bot...',
            'Ready. Type a question to start interacting!'
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

    // Get Bot Response (AFTER JSON is loaded)
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Bot responses loaded successfully.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {}; // Keep it an object to prevent errors
        }
    }

    // Match user input against multiple possible keys
    function getBotResponse(input) {
        input = input.toLowerCase();

        if (Object.keys(responses).length === 0) {
            return "Responses are still loading... Please try again in a moment.";
        }

        // Check for keyword matches
        for (let key in responses) {
            let possibleInputs = key.split("|"); // Split multiple patterns
            if (possibleInputs.some(word => input.includes(word))) {
                return responses[key]; // Return the matched response
            }
        }

        return "I didn't understand that. Try asking about my portfolio or projects.";
    }
turn responses[input] || "I didn't understand that. Try 'portfolio' or 'projects'.";
    }

    // Handle user input (Wait for JSON to load)
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value;
            displayMessage(`> ${userMessage}`, 'user');

            setTimeout(() => {
                const botMessage = getBotResponse(userMessage);
                displayMessage(botMessage, 'bot');
            }, 500); // Typing delay for realism

            userInput.value = ''; // Clear input
        }
    });

    // Run functions on page load
    displayWelcomeMessage();
    loadResponses();
});
