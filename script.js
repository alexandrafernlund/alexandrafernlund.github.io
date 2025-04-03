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

    return "I didn't understand that. There must be a bug in my code.... Damn.";
}
