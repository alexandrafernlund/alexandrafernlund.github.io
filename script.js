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

    // Match user input against multiple possible keys
    function getBotResponse(input) {
        input = input.toLowerCase();

        if (Object.keys(responses).length === 0) {
            return "I need to get my neurons working. Give me a second...";
        }

        // Check for keyword matches
        for (let key in responses) {
            let possibleInputs = key.split("|"); // Split multiple patterns
            if (possibleInputs.some(word => input.includes(word))) {
                return responses[key]; // Return the matched response
            }
        }

        return "I didn't understand that. Guess I have a bug in my code... Damn.";
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
    loadResponses().then(() => {
        console.log("Responses are ready to be used.");
    });
});
