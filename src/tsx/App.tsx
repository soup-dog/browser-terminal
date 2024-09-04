import * as React from "react";
import { Directory, stringifyPath, arrayPath, sanitisePath } from "../Directory";
import API from "../API";
import EnvironmentVariables from "../EnvironmentVariables";
import guesser from "../programs/guesser";
import trains from "../programs/trains";
import box from "../programs/box";
import rat from "../programs/rat";
import ls from "../programs/ls";
import cd from "../cd";
import Terminal from "./Terminal";
import { simpleProgram } from "../util";
import { Program } from "../Program";


const filesystem = Directory.fromObject({
    "foo.txt": "This is some text stored in foo.txt!",
    foo: {
        "inside.txt": "I'm some text inside a file inside a folder!",
    },
    games: {},
    tools: {},
});

filesystem.childDirectories.get("games").children.set("guesser", guesser);

filesystem.childDirectories.get("tools").children.set("box", box);

filesystem.childDirectories.get("games").children.set("trains", trains);

const programs = new Map<string, Program>();
// programs.set("echo", async (s, api) => api.current.pushOverEditable(s.split(" ").slice(1).join(" ")));
programs.set("echo", simpleProgram(s => s.split(" ").slice(1).join(" ")));
programs.set("rat", rat);
programs.set("ls", ls);
programs.set("cd", cd);
programs.set("help", simpleProgram(s => {
    switch (s.split(" ")[1]) {
        case "rat":
            return "cat but it has rabies and is from the sewer.";
        case "cd":
            return "Change directory."
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

export default function App() {
    return (
        <Terminal programs={programs} filesystem={filesystem} />
    )
}
