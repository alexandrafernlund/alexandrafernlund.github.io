const FileSystem = (() => {

    /* ================================================= */
    /* STATE */
    /* ================================================= */

    let cwd = "/";

    const structure = {
        name: "/",
        type: "dir",
        children: {
            projects: {
                type: "dir",
                children: {
                    "terminal-system": {
                        type: "file",
                        content: "Interactive shell portfolio environment"
                    },
                    "dna-analysis-tool": {
                        type: "file",
                        content: "Bacterial sequence matching system"
                    },
                    "networking-labs": {
                        type: "file",
                        content: "Educational infrastructure simulations"
                    }
                }
            },

            system: {
                type: "dir",
                children: {
                    "kernel.sys": {
                        type: "file",
                        content: "core system module"
                    },
                    "boot.log": {
                        type: "file",
                        content: "boot sequence log"
                    }
                }
            },

            user: {
                type: "dir",
                children: {
                    "profile.txt": {
                        type: "file",
                        content: "Alexandra Fernlund — systems / networking / dev"
                    }
                }
            }
        }
    };


    /* ================================================= */
    /* PATH UTILITIES */
    /* ================================================= */

    function normalize(path) {

        const parts = path.split("/").filter(Boolean);
        const stack = [];

        for (const p of parts) {

            if (p === "..") stack.pop();
            else if (p !== ".") stack.push(p);

        }

        return "/" + stack.join("/");

    }

    function resolve(path) {

        if (!path || path === ".") return cwd;
        if (path === "/") return "/";

        if (path.startsWith("/")) return normalize(path);

        return normalize(cwd + "/" + path);
    }


    /* ================================================= */
    /* CORE TRAVERSAL */
    /* ================================================= */

    function getNode(path) {

        const resolved = resolve(path);
        const parts = resolved.split("/").filter(Boolean);

        let node = structure;

        for (const part of parts) {

            if (!node.children?.[part]) return null;

            node = node.children[part];

        }

        return node;
    }


    /* ================================================= */
    /* OPERATIONS */
    /* ================================================= */

    function ls(path = cwd) {

        const node = getNode(path);
        if (!node || node.type !== "dir") return null;

        return Object.entries(node.children).map(([name, child]) => ({
            name,
            type: child.type
        }));
    }

    function cd(path) {

        const target = resolve(path);
        const node = getNode(target);

        if (!node || node.type !== "dir") return false;

        cwd = target;
        return true;
    }

    function cat(path) {

        const node = getNode(path);

        if (!node || node.type !== "file") return null;

        return node.content;
    }


    /* ================================================= */
    /* TREE (clean recursion, no repeated resolve) */
    /* ================================================= */

    function treeFromNode(node, prefix = "") {

        if (!node || node.type !== "dir") return [];

        const entries = Object.entries(node.children);
        const lines = [];

        entries.forEach(([name, child], i) => {

            const last = i === entries.length - 1;
            const branch = last ? "└── " : "├── ";

            lines.push(prefix + branch + name);

            if (child.type === "dir") {

                const extension = last ? "    " : "│   ";

                lines.push(...treeFromNode(child, prefix + extension));
            }
        });

        return lines;
    }

    function tree(path = cwd) {

        const node = getNode(path);
        return treeFromNode(node);
    }


    /* ================================================= */
    /* PUBLIC API */
    /* ================================================= */

    return {

        get cwd() {
            return cwd;
        },

        ls,
        cd,
        cat,
        tree

    };

})();

window.FileSystem = FileSystem;