document.addEventListener('DOMContentLoaded', function () {
    const userInput = document.getElementById('userInput');
    const output = document.getElementById('output');
    let responses = {};
    let lastResponseByCategory = {};
    let fuse;

    // Load responses
    async function loadResponses() {
        try {
            const response = await fetch('responses.json');
            responses = await response.json();
            console.log("Loaded responses:", responses);
            initializeFuse();
            displayWelcomeMessage();
        } catch (error) {
            console.error("Error loading responses.json:", error);
        }
    }

    // Normalize and Extract Entities using Compromise
    function processInput(input) {
        const doc = nlp(input.trim().toLowerCase());  // Normalize input
        
        // Extract nouns and verbs
        const verbs = doc.verbs().out('array');
        const nouns = doc.nouns().out('array');
        
        // You can also extract other entities like dates, people, places, etc.
        const dates = doc.dates().out('array');
        const places = doc.places().out('array');

        console.log("Normalized Text: ", doc.normalize().out('text'));  // Normalized input text
        console.log("Verbs: ", verbs);
        console.log("Nouns: ", nouns);
        console.log("Dates: ", dates);
        console.log("Places: ", places);

        // Return the extracted entities to be used in your response handling logic
        return {
            normalized: doc.normalize().out('text'),
            verbs: verbs,
            nouns: nouns,
            dates: dates,
            places: places
        };
    }

    // Get bot response using the processed input
    function getBotResponse(input) {
        const processedInput = processInput(input); // Process the input for normalization and entity extraction
        const { normalized, verbs, nouns, dates, places } = processedInput;

        // Use the extracted data to find a matching response
        let responseKey = matchIntent(normalized) || matchIntent(input);

        // Example: Responding to specific entities like verbs or nouns
        if (!responseKey) {
            for (const key in responses) {
                const aliases = responses[key].aliases || [key];
                if (nouns.some(noun => aliases.includes(noun)) || verbs.some(verb => aliases.includes(verb))) {
                    responseKey = key;
                    break;
                }
            }
        }

        // If no response is found, fall back to a random response or a default message
        return responseKey ? getRandomResponse(responses[responseKey].text, responseKey) : "Sorry, I didn't understand that.";
    }

    // Typewriter effect
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
                callback();
            }
        }
        typeNextChar();
    }

    // Display the message
    function displayMessage(message, sender, callback) {
        const div = document.createElement('div');
        div.classList.add(sender);
        output.appendChild(div);
        typeMessage(message, sender, callback);
        scrollToBottom();
    }

    function scrollToBottom() {
        output.scrollTop = output.scrollHeight;
    }

    // Listen for Enter key
    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && userInput.value.trim() !== '') {
            const userMessage = userInput.value.trim();
            displayMessage(`> ${userMessage}`, 'user');
            userInput.value = '';
            
            const botMessage = getBotResponse(userMessage);

            displayMessage(botMessage, 'bot');
        }
    });

    // Start bot
    loadResponses();
});
