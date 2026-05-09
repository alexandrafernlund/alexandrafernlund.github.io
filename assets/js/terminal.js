const Terminal = (() => {

    const outputEl = document.getElementById("output");
    const inputEl = document.getElementById("userInput");

    let history = [];
    let historyIndex = -1;
    let bootComplete = false;
    let hasShownHelpHint = false;

    /* ================================================= */
    /* INIT */
    /* ================================================= */

    function init() {

        console.log("Commands at boot:", window.Commands);

        inputEl.addEventListener("keydown", handleInput);
        bootSequence();

    }

    /* ================================================= */
    /* INPUT HANDLER */
    /* ================================================= */

    async function handleInput(e) {

        /* HISTORY UP */
        if (e.key === "ArrowUp") {

            e.preventDefault();

            if (historyIndex > 0) {
                historyIndex--;
                inputEl.value = history[historyIndex];
            }

            return;
        }

        /* HISTORY DOWN */
        if (e.key === "ArrowDown") {

            e.preventDefault();

            if (historyIndex < history.length - 1) {
                historyIndex++;
                inputEl.value = history[historyIndex];
            } else {
                historyIndex = history.length;
                inputEl.value = "";
            }

            return;
        }

        /* ENTER */
        if (e.key !== "Enter") return;
        if (!bootComplete) return;

        const raw = inputEl.value.trim();
        if (!raw) return;

        inputEl.value = "";

        history.push(raw);
        historyIndex = history.length;

        logUser(raw);

        const { command, args } = parse(raw);

        await route(command, args);
    }

    /* ================================================= */
    /* BOOT SEQUENCE (CLEAN + CONSISTENT LOGGING) */
    /* ================================================= */

    async function bootSequence() {

        const steps = [
            ["SYS", "initializing core modules"],
            ["SYS", "loading terminal interface"],
            ["FS", "mounting filesystem"],
            ["MEM", "restoring session state"],
            ["NET", "establishing secure connection"],
            ["OK", "system ready"]
        ];

        for (const [type, text] of steps) {
            logSystem(type, text);
            await wait(520);
        }

        bootComplete = true;

        await wait(200);

        logSystem("SYS", "boot complete");

        logPlain(`
        WELCOME TO ALEXANDRA SYSTEM SHELL

        This is a simulated operating system interface.

        BASIC NAVIGATION:
        - ls        → list files
        - cd <dir>  → enter directory
        - cd ..     → go back
        - pwd       → show location
        - cat <file>→ read file contents

        `.trim());

        inputEl.focus();

        if (!hasShownHelpHint) {
            logSystem("INFO", "type 'help' to see available commands");
            hasShownHelpHint = true;
        }
    }

    /* ================================================= */
    /* PARSER */
    /* ================================================= */

    function parse(input) {

        const parts = input.trim().split(" ");

        return {
            command: parts[0].toLowerCase(),
            args: parts.slice(1)
        };

    }

    /* ================================================= */
    /* ROUTER */
    /* ================================================= */

    async function route(command, args) {

        if (!command) return;

        const cmd = window.Commands?.[command];

        console.log("CMD:", command, "FOUND:", cmd);

        if (typeof cmd === "function") {
            await cmd(args);
        } else {
            logError(`unknown command: ${command}`);
        }
    }

    /* ================================================= */
    /* OUTPUT CORE (ONE SYSTEM ONLY) */
    /* ================================================= */

    function append(el) {
        outputEl.appendChild(el);
        scroll();
    }

    function logUser(text) {

        const el = document.createElement("div");
        el.className = "user-command";
        el.textContent = text;

        append(el);
    }

    function logSystem(type, text) {

        const el = document.createElement("div");
        el.className = "system-message";

        el.innerHTML = `
            <span class="log-tag">[${type}]</span>
            <span>${text}</span>
        `;

        append(el);
    }

    function logPlain(text) {

        const el = document.createElement("div");
        el.className = "output-block";
        el.textContent = text;

        append(el);
    }

    function logError(text) {

        const el = document.createElement("div");
        el.className = "error-message";

        el.innerHTML = `
            <span class="log-tag">[ERR]</span>
            <span>${text}</span>
        `;

        append(el);
    }

    async function printBlock(text, delay = 0) {

    const lines = text.trim().split("\n");

    for (const line of lines) {

        logPlain(line);

        if (delay > 0) {
            await wait(delay);
        }
    }
}

    async function printLines(lines, delay = 40) {

        for (const line of lines) {

            logPlain(line);

            await wait(delay);
        }
    }

    /* ================================================= */
    /* UTILITIES */
    /* ================================================= */

    function scroll() {
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    function clear() {
        outputEl.innerHTML = "";
    }

    function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    /* ================================================= */
    /* PUBLIC API */
    /* ================================================= */

    return {
        init,
        logPlain,
        logSystem,
        logError,
        clear,
        wait,
        printBlock,
        printLines
    };

})();

/* ===================================================== */
/* START SYSTEM */
/* ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
    Terminal.init();
});