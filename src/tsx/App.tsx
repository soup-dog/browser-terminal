import * as React from "react";
import { Directory, stringifyPath, arrayPath, sanitisePath } from "./Directory";

// interface Directory {
//     parent: Directory | null,
//     childDirectories: Map<string, Directory>,
//     children: any[],
// }

// function makeDirectory(data: any, parent: Directory = null): Directory {
//     const directory: Directory = {
//         parent: parent,
//         childDirectories: new Map(),
//         children: [],
//     };

//     for (const entry of Object.entries(data)) {
//         const [name, content] = entry;
//         if (content instanceof Object) {
//             directory.childDirectories.set(name, makeDirectory(content, directory));
//         }
//         else {
//             directory.children.push(content);
//         }
//     }

//     return directory;
// }

// function absolutePath(directory: Directory) {
//     return absolutePath(directory);
// }

const filesystem = Directory.fromObject({
    "foo.txt": "Hello world!",
    foo: {},
});

console.log(filesystem);
console.log(filesystem.childDirectories.get("foo").path());

function simpleProgram(program: (input: string) => string) {
    return async (input: string, api: React.MutableRefObject<API>) => {
        api.current.pushOverEditable(program(input));
    };
}

function synchronousProgram(program: (input: string, api: React.MutableRefObject<API>) => string) {
    return async (input: string, api: React.MutableRefObject<API>) => {
        api.current.pushOverEditable(program(input, api));
    };
}

const programs = new Map<string, Program>();
// programs.set("echo", async (s, api) => api.current.pushOverEditable(s.split(" ").slice(1).join(" ")));
programs.set("echo", simpleProgram(s => s.split(" ").slice(1).join(" ")));
programs.set("cat", synchronousProgram((s, api) => {
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
    const wd = api.current.getEnv().current.workingDir;
    const res = filesystem.resolvePath(wd).resolvePath(path);
    if (res === undefined) return "Not found.";
    if (res instanceof Directory) return "Path is a directory.";
    return res.toString();
}));
programs.set("ls", synchronousProgram((s, api) => {
    const wd = api.current.getEnv().current.workingDir;
    const dir = filesystem.resolvePath(wd);
    return stringifyPath(wd) + " (" + dir.name + ")\n=== Directories ===\n\t" + [...dir.childDirectories.keys()].join("\n\t") + "\n=== Files ===\n\t" + [...dir.children.keys()].join("\n\t");
}));
programs.set("cd", synchronousProgram((s, api) => {
    // const path = s.split(" ").slice(1).join(" ").replace("\n", "").split("/").filter(v => v !== ".");
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
    if (path.length === 0) return "";
    // console.log(api.current.getEnv().current.workingDir);
    const filesystem = api.current.getFilesystem();
    const res = filesystem.resolvePath(api.current.getEnv().current.workingDir).resolvePath(path);
    if (res === undefined) return "Path could not be resolved";
    if (res instanceof Directory) {
        api.current.getEnv().current.workingDir = res.path();
        return "";
    }
    return "Path resolves to a file.";
    // if (path[0] !== "") { // relative
    //     path = api.current.getEnv().current.workingDir.concat(path);
    // } // now absolute
    // // const actualPath = [];
    // let current = filesystem;
    // for (const dir of path) {
    //     if (dir === "..") {
    //         current = current.parent ?? current;
    //         continue;
    //     }
    //     const next = current.childDirectories.get(dir);
    //     if (next === undefined) {
    //         if (current.children.has(dir)) {
    //             return dir + " is not a directory.";
    //         }
    //         return dir + " does not exist.";
    //     }
    //     // actualPath.push(dir);
    //     current = next;
    // }
    // api.current.getEnv().current.workingDir = current.path();
    // return "";
}));
programs.set("help", simpleProgram(_ => [...programs.keys()].join("\n")))

// https://w3c.github.io/input-events/#interface-InputEvent-Attributes
// deleteContent needs testing
const DELETE_BACKWARDS = ["deleteWordBackward", "deleteSoftLineBackward", "deleteHardLineBackward", "deleteContent", "deleteContentBackward"];

type Program = (input: string, api: React.MutableRefObject<API>) => Promise<any>;

interface API {
    pushBeforeEditable: (s: string) => any,
    pushOverEditable: (s: string) => any,
    // outputState: () => OutputState,
    setOutputState: (state: OutputState) => any,
    getFilesystem: () => Directory,
    getEnv: () => React.MutableRefObject<EnvironmentVariables>,
}

interface EnvironmentVariables {
    workingDir: string[],
}

interface OutputState {
    output: string,
    editableIndex: number,
}

export default function App() {
    const envRef = React.useRef<EnvironmentVariables>({
        workingDir: [""],
    });

    function getPrompt() {
        // return "\nλ > ";
        return "\n" + stringifyPath(envRef.current.workingDir) + " > ";
    }

    // const [output, setOutput] = React.useState("Hello world!\nWelcome to Shiterminal!\n" + getPrompt());
    const [outputState, setOutputState] = React.useState<OutputState>(() => {
        const s = "Hello world!\nWelcome to Shiterminal!\n" + getPrompt();
        return {
            output: s,
            editableIndex: s.length,
        };
    });
    // const [selection, setSelection] = React.useState<[number | null, number | null] | null>(null);
    // const realStart = React.useRef(null);
    // const realSelection = React.useRef<[number | null, number | null] | null>([0, 0]);
    const textarea = React.useRef<HTMLTextAreaElement>(null);
    // const [editableIndex, setEditableIndex] = React.useState(output.length);
    const shiftDown = React.useRef(false);
    const [state, setState] = React.useState<"shell" | "program">("shell");
    const apiRef = React.useRef<API>(null);
    apiRef.current = {
        pushBeforeEditable: pushBeforeEditable,
        pushOverEditable: pushOverEditable,
        setOutputState: setOutputState,
        getFilesystem: () => filesystem,
        getEnv: () => envRef,
    };

    // function writeSelection() {
    //     if (selection && textarea.current) {
    //         [textarea.current.selectionStart, textarea.current.selectionEnd] = selection;
    //     }
    // }

    // function prompt() {
    //     setOutputAndShiftIndex(output + getPrompt());
    // }

    // function setOutputAndShiftIndex(newOutput: string) {
    //     setOutput(newOutput);
    //     setEditableIndex(newOutput.length);
    // }

    function pushBeforeEditable(s: string) {
        setOutputState(state => {
            // console.log(state.output.slice(0, state.editableIndex));
            // console.log(state.output.slice(state.editableIndex));
            return {
                output: state.output.slice(0, state.editableIndex) + s + state.output.slice(state.editableIndex),
                editableIndex: state.editableIndex + s.length,
            };
        });
    }

    function pushOverEditable(s: string) {
        setOutputState(state => {
            const newOutput = state.output + s;
            return {
                output: newOutput,
                editableIndex: newOutput.length,
            };
        });
    }

    function bringEditableToFront() {
        setOutputState(state => ({
            ...state,
            editableIndex: state.output.length,
        }));
    }

    // const api = {
    //     pushBeforeEditable: pushBeforeEditable,
    //     pushOverEditable: pushOverEditable,
    //     setOutputState: setOutputState,
    // }

    function shell(input: string) {
        const split = input.split(" ");
        if (split.length === 0) return;
        const program = programs.get(split[0]);
        if (program) {
            program(input, apiRef).then(() => {
                setState("shell");
                pushOverEditable(getPrompt());
            });
        }
        else if (input === "") {
            pushBeforeEditable(getPrompt());
        }
        else {
            pushOverEditable(input + " is not a program." + getPrompt());
        }
    }

    // React.useEffect(() => {
    //     if (selection && textarea.current) {
    //         [textarea.current.selectionStart, textarea.current.selectionEnd] = selection;
    //     }
    // }, [selection]);

    React.useEffect(() => {
        if (textarea.current) {
            const onBeforeInput = (e: InputEvent) => {
                if (e.inputType === "deleteEntireSoftLine") {
                    // TODO: handle this properly, this should only not work on a line with non-editable content
                    e.preventDefault();
                    return;
                }
                const element = (e.target as HTMLTextAreaElement);
                const start = element.selectionStart + (DELETE_BACKWARDS.includes(e.inputType) ? -1 : 0);

                if (start < outputState.editableIndex) {
                    // setOutput(element.value);
                    // setSelection([start, end]);
                    e.preventDefault();
                }
                // else if (keepSelection) {
                //     // maybe retain selection

                //     // writeSelection();
                //     // setOutput(output);
                //     if (realSelection.current) {
                //         setSelection([...realSelection.current]);
                //     }
                // }
                // console.log("prevent default");
                // e.preventDefault();
            };
            textarea.current.addEventListener("beforeinput", onBeforeInput);
            return () => textarea.current.removeEventListener("beforeinput", onBeforeInput);
        }
    }, [textarea]);

    return (
        <textarea
            // onSelect={(e) => {
            //     const element = (e.target as HTMLTextAreaElement);
            //     // realStart.current = (e.target as HTMLTextAreaElement).selectionStart;
            //     realSelection.current = [element.selectionStart, element.selectionEnd];
            //     // console.log(realStart.current);
            // }}
            ref={textarea}
            value={outputState.output}
            onChange={e => {
                const newOutput = e.target.value;
                if (!shiftDown.current && newOutput.length !== 0 && newOutput[newOutput.length - 1] === "\n" && e.target.selectionStart === newOutput.length) {
                    setOutputState(state => ({
                        output: newOutput,
                        editableIndex: newOutput.length,
                    }));
                    setState("program");
                    shell(newOutput.slice(outputState.editableIndex, newOutput.length - 1));
                    // setOutputState(state => ({
                    //     ...state,
                    //     output: state + shell(newOutput.slice(state.editableIndex, newOutput.length - 1)),
                    // }));
                }
                else {
                    setOutputState(state => ({
                        ...state,
                        output: newOutput,
                    }));
                }
            }}
            onKeyDown={e => {
                if (e.key === "Shift") {
                    shiftDown.current = true;
                }
            }}
            onKeyUp={e => {
                if (e.key === "Shift") {
                    shiftDown.current = false;
                }
            }}
            // old code that will work better on older browsers
            // could switch back to this and remove multiline inputs by just executing line when newline is added
            // onChange={(e) => {
            //     // case: selection is fully in editable area: execute change
            //     // case: selection is fully outside editable area: ignore change and do not update selection
            //     // case: selection spans both areas: ???

            //     console.log(textarea.current.selectionStart);

            //     const start = e.target.selectionStart; // selection start after edit
            //     const end = e.target.selectionEnd;

            //     if (realSelection.current[0] >= editableIndex && start >= editableIndex) {
            //         setOutput(e.target.value);
            //         // setSelection([start, end]);
            //     }
            //     else if (keepSelection) {
            //         // maybe retain selection

            //         // writeSelection();
            //         // setOutput(output);
            //         if (realSelection.current) {
            //             setSelection([...realSelection.current]);
            //         }
            //     }

            //     // const newOutput = e.target.value;
            //     // setOutput(output);
            //     // setSelection([e.target.selectionStart, e.target.selectionEnd]);
            // }}
            // onKeyDown={(e) => {
            //     if (e.key === "Enter") {
            //         // TODO: bug here where if enter and another key is pressed at the same time, this will not trigger
            //         // doesn't happen very often though 
            //         if (realSelection.current[0] === output.length) {
            //             e.preventDefault();

            //         }
            //     }
            // }}
            spellCheck={false}
        >

        </textarea>
    );
}
