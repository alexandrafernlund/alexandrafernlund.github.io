const Commands = {

    /* ================================================= */
    /* HELP */
    /* ================================================= */

    async help() {

        Terminal.logPlain(`
COMMAND MANUAL
    ────────────────────────────

    NAVIGATION
    ls [path]        list directory contents
    cd <dir>         change directory
    pwd              print working directory
    cat <file>       read file contents
    tree [path]      visualize filesystem

    SYSTEM
    clear            clear terminal screen
    help             show this manual

    TIPS
    - use "cd .." to go back
    - paths can be absolute or relative
    - everything is a virtual filesystem
        `.trim());

    },


    /* ================================================= */
    /* PWD */
    /* ================================================= */

    async pwd() {

        Terminal.logPlain(FileSystem.cwd);

    },


    /* ================================================= */
    /* LS */
    /* ================================================= */

    async ls(args) {

        const path = args[0] || FileSystem.cwd;
        const result = FileSystem.ls(path);

        if (!result) {
            Terminal.logError(`ls: cannot access '${path}'`);
            return;
        }

        result.forEach(item => {

            const prefix = item.type === "dir" ? "d" : "f";
            Terminal.logPlain(`${prefix} ${item.name}`);

        });

    },


    /* ================================================= */
    /* CD */
    /* ================================================= */

    async cd(args) {

        const target = args[0];

        if (!target) {
            Terminal.logError("cd: missing operand");
            return;
        }

        const ok = FileSystem.cd(target);

        if (!ok) {
            Terminal.logError(`cd: no such directory: ${target}`);
            return;
        }

        Terminal.logSystem("SYS", `entered ${FileSystem.cwd}`);

    },


    /* ================================================= */
    /* CAT */
    /* ================================================= */

    async cat(args) {

        const file = args[0];

        if (!file) {
            Terminal.logError("cat: missing file operand");
            return;
        }

        const content = FileSystem.cat(file);

        if (!content) {
            Terminal.logError(`cat: cannot open '${file}'`);
            return;
        }

        Terminal.logPlain(content);

    },


    /* ================================================= */
    /* TREE */
    /* ================================================= */

    async tree(args) {

        const path = args[0] || FileSystem.cwd;
        const lines = FileSystem.tree(path);

        lines.forEach(line => Terminal.logPlain(line));

    },


    /* ================================================= */
    /* CLEAR */
    /* ================================================= */

    async clear() {

        Terminal.clear();

    }

};

window.Commands = Commands;