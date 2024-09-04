"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const React = require("react");
const Directory_1 = require("../Directory");
const guesser_1 = require("../programs/guesser");
const trains_1 = require("../programs/trains");
const box_1 = require("../programs/box");
const rat_1 = require("../programs/rat");
const ls_1 = require("../programs/ls");
const cd_1 = require("../programs/cd");
const Terminal_1 = require("./Terminal");
const util_1 = require("../util");
const filesystem = Directory_1.Directory.fromObject({
    "foo.txt": "This is some text stored in foo.txt!",
    foo: {
        "inside.txt": "I'm some text inside a file inside a folder!",
    },
    games: {},
    tools: {},
});
filesystem.childDirectories.get("games").children.set("guesser", guesser_1.default);
filesystem.childDirectories.get("tools").children.set("box", box_1.default);
filesystem.childDirectories.get("games").children.set("trains", trains_1.default);
const programs = new Map();
// programs.set("echo", async (s, api) => api.current.pushOverEditable(s.split(" ").slice(1).join(" ")));
programs.set("echo", (0, util_1.simpleProgram)(s => s.split(" ").slice(1).join(" ")));
programs.set("rat", rat_1.default);
programs.set("ls", ls_1.default);
programs.set("cd", cd_1.default);
programs.set("help", (0, util_1.simpleProgram)(s => {
    switch (s.split(" ")[1]) {
        case "rat":
            return "cat but it has rabies and is from the sewer.";
        case "cd":
            return "Change directory.";
        case "ls":
            return "List directories and files in current directory.";
        case "help":
            return "Help.";
        case "echo":
            return "";
        default:
            return [...programs.keys()].join("\n");
    }
}));
function App() {
    return (React.createElement(Terminal_1.default, { programs: programs, filesystem: filesystem }));
}
