const Terminal = (() => {

    const outputEl = document.getElementById("output");
    const inputEl = document.getElementById("userInput");
    const promptEl = document.getElementById("prompt");

    let history = [];
    let historyIndex = -1;
    let bootComplete = false;

    /* ================================================= */
    /* WINDOW SYSTEM */
    /* ================================================= */

    let windows = [];
    let zIndex = 1000;

    function bringToFront(el) {
        el.style.zIndex = ++zIndex;
    }

    function makeDraggable(win) {

        const header = win.querySelector(".file-viewer-header");

        let active = false;
        let offsetX = 0;
        let offsetY = 0;

        header.style.cursor = "grab";

        header.addEventListener("mousedown", (e) => {

            active = true;

            const rect = win.getBoundingClientRect();

            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            header.style.cursor = "grabbing";
            bringToFront(win);
        });

        document.addEventListener("mousemove", (e) => {

            if (!active) return;

            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        });

        document.addEventListener("mouseup", () => {
            active = false;
            header.style.cursor = "grab";
        });
    }

    /* ================================================= */
    /* INIT */
    /* ================================================= */

    function init() {

        console.log("Commands loaded:", window.Commands);
        console.log("Filesystem loaded:", window.FileSystem);

        inputEl.addEventListener("keydown", handleInput);

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllWindows();
        });

        SystemEvents.on((msg) => logSystem("SYS", msg));
        SystemEvents.startNoiseLoop();

        bootSequence();
    }

    /* ================================================= */
    /* WINDOW API */
    /* ================================================= */

    function openFileView(content, filename = "file") {

        const win = document.createElement("div");
        win.className = "file-window";

        win.style.position = "fixed";
        win.style.left = "200px";
        win.style.top = "200px";
        win.style.zIndex = ++zIndex;

        win.innerHTML = `
            <div class="file-viewer-header">
                <span class="title">${filename}</span>
            </div>
            <div class="file-viewer-content"></div>
        `;

        win.querySelector(".file-viewer-content").textContent = content;

        document.body.appendChild(win);

        makeDraggable(win);

        windows.push(win);

        bringToFront(win);
    }

    function closeAllWindows() {
        windows.forEach(w => w.remove());
        windows = [];
    }

    /* ================================================= */
    /* INPUT HANDLER */
    /* ================================================= */

    async function handleInput(e) {

        if (e.key === "Enter") {

            if (!bootComplete) return;

            const raw = inputEl.value.trim();
            if (!raw) return;

            inputEl.value = "";

            logUser(raw);

            const { command, args } = parse(raw);
            await route(command, args);
        }
    }

    /* ================================================= */
    /* BOOT */
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
            await wait(400);
        }

        bootComplete = true;

        logSystem("SYS", "boot complete");

        await printLines([
            " ",
            "ALEXANDRA OS v1.0",
            "────────────────────────────────",
            "",
            "type 'help' to begin",
            " "
        ], 10);

        updatePrompt();
        inputEl.focus();
    }

    /* ================================================= */
    /* PARSER + ROUTER */
    /* ================================================= */

    function parse(input) {

        const parts = input.split(" ").filter(Boolean);

        return {
            command: (parts[0] || "").toLowerCase(),
            args: parts.slice(1)
        };
    }

    async function route(command, args) {

        const cmd = window.Commands?.[command];

        if (!cmd) {
            logError(`unknown command: ${command}`);
            return;
        }

        await cmd(args);
    }

    /* ================================================= */
    /* OUTPUT */
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
        el.innerHTML = `<span class="log-tag">[${type}]</span> ${text}`;
        append(el);
    }

    function logError(text) {
        const el = document.createElement("div");
        el.className = "error-message";
        el.innerHTML = `<span class="log-tag">[ERR]</span> ${text}`;
        append(el);
    }

    function print(text = "") {
        const el = document.createElement("div");
        el.className = "output-line";
        el.textContent = text;
        append(el);
    }

    async function printLines(lines = [], delay = 25) {

        for (const line of lines) {
            await printStream(line, delay);
        }
    }

    async function printStream(text, delay = 10) {

        const el = document.createElement("div");
        el.className = "output-line";
        outputEl.appendChild(el);

        let out = "";

        for (const char of text) {
            out += char;
            el.textContent = out;
            await wait(delay);
        }

        scroll();
    }

    /* ================================================= */
    /* UTIL */
    /* ================================================= */

    function scroll() {
        outputEl.scrollTop = outputEl.scrollHeight;
    }

    function wait(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    function clear() {
        outputEl.innerHTML = "";
    }

    function updatePrompt() {
        const cwd = window.FileSystem?.cwd ?? "/";
        if (!promptEl) return;
        promptEl.textContent = `visitor@system:${cwd}$`;
    }

    /* ================================================= */
    /* SYSTEM EVENTS */
    /* ================================================= */

    const SystemEvents = (() => {

        let listeners = [];

        function on(fn) {
            listeners.push(fn);
        }

        function emit(e) {
            listeners.forEach(fn => fn(e));
        }

        function randomNoise() {

            const noises = [
                "[SYS] cache flushed",
                "[MEM] cleanup cycle",
                "[NET] heartbeat OK",
                "[FS] indexing",
                "[SYS] idle"
            ];

            emit(noises[Math.floor(Math.random() * noises.length)]);
        }

        function startNoiseLoop() {
            setInterval(() => {
                if (Math.random() < 0.12) randomNoise();
            }, 6000);
        }

        return { on, emit, startNoiseLoop };

    })();

    /* ================================================= */
    /* PUBLIC API */
    /* ================================================= */

    return {
        init,
        print,
        printLines,
        logSystem,
        logError,
        clear,
        wait,
        updatePrompt,
        openFileView,
        closeAllWindows
    };

})();

/* BOOT */
document.addEventListener("DOMContentLoaded", () => {
    Terminal.init();
});