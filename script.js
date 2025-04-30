document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let fuseCommands = []; // To store commands and their aliases
    let fuse = null;

    // Sample response loader function
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();

            // Prepare Fuse.js commands with aliases
            fuseCommands = Object.keys(responses).map(cmd => ({
                key: cmd,
                aliases: responses[cmd].aliases || [cmd]
            }));

            // Initialize Fuse.js for fuzzy matching
            fuse = new Fuse(fuseCommands, {
                keys: ['aliases'],
                threshold: 0.3,  // Low threshold for fuzziness
                includeScore: true
            });

            console.log("Bot responses loaded and Fuse initialized.");
        } catch (error) {
            console.error("Error loading responses.json:", error);
            responses = {};
        }
    }

    // Function to process user input and detect intents using NLP
    function getIntentFromNLP(input) {
        let doc = nlp(input);  // Process the input text

        // Check for known intents using compromise.js and Fuse.js
        const results = fuse.search(input);
        if (results.length > 0) {
            return results[0].item.key;  // Return the best matching response
        }

        // If no match is found in Fuse.js, fall back to "unknown"
        return 'unknown';
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

    // Get the response based on the user input
    function getBotResponse(input) {
        const intent = getIntentFromNLP(input);

        // Return the appropriate response based on the matched intent
        const response = responses[intent] || responses.unknown;
        return response.text;
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
