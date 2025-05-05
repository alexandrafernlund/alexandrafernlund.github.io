document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};

    // Function to toggle between terminal and GUI
    function toggleView() {
        const terminal = document.getElementById('chat-terminal');
        const guiSite = document.getElementById('main-site');
        
        if (terminal.style.display === 'none') {
            terminal.style.display = 'block';
            guiSite.style.display = 'none';
        } else {
            terminal.style.display = 'none';
            guiSite.style.display = 'block';
        }
    }

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
        let fuseCommands = Object.entries(responses).map(([key, value]) => ({
            key,
            aliases: value.aliases || [key]
        }));
    
        fuse = new Fuse(fuseCommands, {
            keys: ['aliases'],
            threshold: 0.4 // Slightly forgiving for fuzziness
        });
    }    

    // Function to process user input and get the best matching response
    function getBotResponse(input) {
        input = input.toLowerCase().trim();
    
        const results = fuse.search(input);
        if (results.length > 0) {
            const bestMatchKey = results[0].item.key;
            const response = responses[bestMatchKey] || responses["unknown"];
            return getRandomResponse(response.text, bestMatchKey);
        }
    
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
                callback(); // Call the callback after typing is done
            }
        }
    
        typeNextChar();
    }    

    // Function to display messages
    function displayMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender, callback);
        scrollToBottom();
    }    

    // Auto-scroll function
    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    // Event listener for user input
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';  // Clear input field

            const botMessage = getBotResponse(userMessage);
            if (botMessage) {
                displayMessage(botMessage, 'bot');
            }
        }
    });

    // Load responses and initialize the chatbot
    loadResponses().then(() => {
        console.log("Responses loaded and ready.");
        initializeFuse();  // Initialize Fuse.js after responses are loaded
    });
});
