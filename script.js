document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let fuse = null;

    // Load responses from JSON
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();

            // Initialize Fuse.js with response keys
            fuse = new Fuse(Object.keys(responses), {
                threshold: 0.3,  // Low threshold for fuzzy matching
                includeScore: true
            });

            console.log("Bot responses loaded and Fuse initialized.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    // Function to process user input and get the best matching response
    function getBotResponse(input) {
        input = input.toLowerCase().trim();

        // Use Fuse.js to search for the best fuzzy match from the keys of responses
        const results = fuse.search(input);
        if (results.length > 0) {
            const bestMatchKey = results[0].item; // Best matching key from Fuse.js
            const response = responses[bestMatchKey] || responses.unknown; // Fallback to "unknown" if no match
            return getRandomResponse(response.text, bestMatchKey);
        }

        // If no match found, fall back to unknown response
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
    });
});
