const Commands = (() => {

    /* ================================================= */
    /* HELP */
    /* ================================================= */

    async function help() {

        await Terminal.printLines([
            "COMMAND MANUAL",
            "────────────────────────────────",
            "",
            "NAVIGATION",
            "",
            "ls                list directory contents",
            "cd <dir>          change directory",
            "cd ..             go back one directory",
            "pwd               print working directory",
            "cat <file>        open file viewer",
            "",
            "SYSTEM",
            "",
            "tree              visualize filesystem",
            "clear             clear terminal",
            "help              show this manual",
            "",
            "────────────────────────────────",
            "",
            "TIP: use 'ls' to explore the filesystem"
        ], 10);
    }


    /* ================================================= */
    /* PWD */
    /* ================================================= */

    async function pwd() {
        Terminal.print(FileSystem.cwd);
    }


    /* ================================================= */
    /* LS */
    /* ================================================= */

    async function ls(args = []) {

        const path = args[0] || FileSystem.cwd;
        const result = FileSystem.ls(path);

        if (!result) {
            Terminal.logError(`ls: cannot access '${path}'`);
            return;
        }

        await Terminal.printLines(
            result.map(item =>
                item.type === "dir"
                    ? `${item.name}/`
                    : item.name
            ),
            0
        );
    }


    /* ================================================= */
    /* CD */
    /* ================================================= */

    async function cd(args = []) {

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
        Terminal.updatePrompt();
    }


    /* ================================================= */
    /* CAT */
    /* ================================================= */

    async function cat(args = []) {

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

        Terminal.openFileView(content, file);
    }


    /* ================================================= */
    /* TREE */
    /* ================================================= */

    async function tree(args = []) {

        const path = args[0] || FileSystem.cwd;
        const lines = FileSystem.tree(path);

        if (!lines) {
            Terminal.logError(`tree: cannot access '${path}'`);
            return;
        }

        for (const line of lines) {
            Terminal.print(line);
        }
    }


    /* ================================================= */
    /* CLEAR */
    /* ================================================= */

    async function clear() {
        Terminal.clear();
        Terminal.updatePrompt();
    }


    /* ================================================= */
    /* EXPORT */
    /* ================================================= */

    return {
        help,
        pwd,
        ls,
        cd,
        cat,
        tree,
        clear
    };

})();

window.Commands = Commands;