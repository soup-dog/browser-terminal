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
    "foo.txt": "This is some text stored in foo.txt!",
    foo: {
        "inside.txt": "I'm some text inside a file inside a folder!",
    },
    games: {},
    tools: {},
});

filesystem.childDirectories.get("games").children.set("guesser", async (input: string, api: React.MutableRefObject<API>) => {
    function getInput() {
        return new Promise((resolve: (v: string) => any) => api.current.onLineBreak = resolve);
    }

    const max = 10;

    const num = Math.floor(Math.random() * max) + 1;

    api.current.pushOverEditable("I'm thinking of a number between 1 and " + max.toString() + ". Try to guess it!");

    while (true) {
        api.current.pushOverEditable("\n>>> ");
        const rawInput = await getInput();
        const numberInput = Number.parseInt(rawInput);
        if (Number.isNaN(numberInput)) {
            api.current.pushBeforeEditable("That's not a number!");
        }
        else if (num > numberInput) {
            api.current.pushOverEditable("Higher...");
        }
        else if (num < numberInput) {
            api.current.pushOverEditable("Lower...");
        }
        else {
            break;
        }
    }

    api.current.pushOverEditable("You guessed the number!");
});

filesystem.childDirectories.get("tools").children.set("box", simpleProgram((s: string) => {
    // ┌┐└┘ ─│
    console.log(JSON.stringify(s));
    const lines = s.split(" ").slice(1).join(" ").split("\n");
    const width = Math.max(...lines.map(l => l.length));
    console.log(lines);

    return "┌" + "─".repeat(width) + "┐\n" + lines.map(l => "│" + l + " ".repeat(width - l.length) + "│\n").join("") + "└" + "─".repeat(width) + "┘\n";
}));


function parseIntDefault(s: string, _default: number): number {
    if (s === undefined || s === null) return _default;
    const num = Number.parseInt(s);
    return Number.isNaN(num) ? _default : num;
}

function selectDefault(s: string, options: string[], _default: string): string {
    if (s === undefined || s === null) return _default;
    if (options.includes(s)) return s;
    return _default;
}

filesystem.childDirectories.get("games").children.set("trains", async (s: string, api: React.MutableRefObject<API>) => {
    // ─│┌┐└┘├┤┬┴┼

    const params = s.split(" ").slice(1);

    if (params[0] === "help" || params[0] === "-h") {
        api.current.pushOverEditable("Model trains.\nUsage: trains <mode: normal|serious|silly|batshit> <railway count> <stop count> <train count> <rows> <cols>");
        return;
    }

    const mode = selectDefault(params[0], ["normal", "serious", "silly", "batshit"], "normal") as "normal" | "serious" | "silly" | "batshit";
    const railwayCount = parseIntDefault(params[1], 3);
    const stopCount = parseIntDefault(params[2], 3);
    const trainCount = parseIntDefault(params[3], 3);
    const rows = parseIntDefault(params[4], 64);
    const cols = parseIntDefault(params[5], 64);

    let interval: NodeJS.Timeout;

    function pToI(r: number, c: number): number {
        return cols * r + c;
    }

    function iToP(i: number): [number, number] {
        return [Math.floor(i / cols), i % cols];
    }

    function wrapP(r: number, c: number): [number, number] {
        const point: [number, number] = [r, c];
        if (point[0] >= rows) point[0] = 0;
        if (point[0] < 0) point[0] = rows - 1;
        if (point[1] >= cols) point[1] = 0;
        if (point[1] < 0) point[1] = cols - 1;
        return point;
    }

    function getOffset(direction: number) {
        switch (direction) {
            case 0: // +r
                return [1, 0];
            case 1: // +c
                return [0, 1];
            case 2: // -r
                return [-1, 0];
            case 3: // -c
                return [0, -1];
        }
    }

    function rotateDirection(direction: number, steps: number) {
        // let newDirection = (direction + steps) % 4;
        // if (newDirection < 0) newDirection = 4 + newDirection;
        // return newDirection;
        return (direction + steps) & 0b11;
    }

    function invertDirection(direction: number) {
        return direction ^ 0b10;
    }

    function getDirection(fromR: number, fromC: number, toR: number, toC: number): number {
        const deltaR = toR - fromR;
        const deltaC = toC - fromC;

        if (Math.abs(deltaR) >= Math.abs(deltaC)) {
            return deltaR > 0 ? 0 : 2;
        }
        else {
            return deltaC > 0 ? 1 : 3;
        }
    }

    // function makeRailway() {
    //     let origin = Math.floor(Math.random() * rows * cols);
    //     let current = origin;
    //     let currentDirection = Math.floor(Math.random() * 4);
    //     const railway: { i: number, direction: number }[] = [];

    //     while (current !== origin || railway.length === 0) {
    //         // currentDirection = currentDirection + Math.floor(Math.random() * 3) - 1;
    //         // console.log(currentDirection);
    //         // if (currentDirection > 3) currentDirection = 0;
    //         // if (currentDirection < 0) currentDirection = 3;
    //         const nextDirection = rotateDirection(currentDirection, Math.floor(Math.random() * 3) - 1);
    //         const currentPoint = iToP(current);
    //         const offset = getOffset(nextDirection);
    //         const nextPoint = [currentPoint[0] + offset[0], currentPoint[1] + offset[1]];
    //         // console.log(currentPoint);
    //         // console.log(nextPoint);
    //         if (nextPoint[0] >= rows) nextPoint[0] = 0;
    //         if (nextPoint[0] < 0) nextPoint[0] = rows - 1;
    //         if (nextPoint[1] >= cols) nextPoint[1] = 0;
    //         if (nextPoint[1] < 0) nextPoint[1] = cols - 1;
    //         const nextIndex = pToI(nextPoint[0], nextPoint[1]);
    //         if (railway.length !== 0 &&
    //             nextIndex === origin &&
    //             railway[0].direction === nextDirection) continue;
    //         currentDirection = nextDirection;
    //         railway.push({ i: current, direction: currentDirection });
    //         current = nextIndex;
    //     }

    //     return railway;
    // }

    function makeRailway(stops: number[] = null, stopCount: number = 3, mode: "normal" | "serious" | "silly" | "batshit" = "normal") {
        if (!stops) {
            stops = [];
            for (let i = 0; i < stopCount; i++) {
                stops.push(Math.floor(Math.random() * rows * cols));
            }
        }

        const railway: { i: number, direction: number }[] = [];

        let current = stops[0];
        let direction = 0;
        let stopIndex = 1;

        while (true) {
            if (current === stops[stopIndex]) {
                if (stopIndex === 0) {
                    break;
                }
                stopIndex++;
            }
            const stop = stops[stopIndex];
            const [r, c] = iToP(current);
            const currentPoint = iToP(current);
            const lastDirection = direction;

            switch (mode) {
                case "normal":
                    // move in optimal direction with 1/4 chance to rotate in either direction
                    direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 1.5 + 0.75) - 1);
                    break;
                case "serious":
                    direction = getDirection(r, c, ...iToP(stop));
                    break;
                case "silly":
                    direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 2 + 0.5) - 1);
                    break;
                case "batshit":
                    direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
                    break;
            }
            if (direction === invertDirection(lastDirection)) { // try not to do a 180 
                direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
            }

            // // move in optimal direction with 1/4 chance to rotate in either direction
            // direction = getDirection(r, c, ...iToP(stop));
            // // direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 2 + 0.5) - 1);
            // // if (direction === invertDirection(lastDirection)) { // try not to do a 180 
            // //     direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
            // // }
            railway.push({
                i: current,
                direction: direction,
            });
            const offset = getOffset(direction);
            const nextPoint = wrapP(currentPoint[0] + offset[0], currentPoint[1] + offset[1]);
            current = pToI(...nextPoint);
            if (stopIndex >= stops.length) {
                stopIndex = 0;
            }

            // const [r, c] = iToP(current);
            // const currentPoint = iToP(current);
            // const offset = getOffset(direction);
            // const nextPoint = wrapP(currentPoint[0] + offset[0], currentPoint[1] + offset[1]);
            // const nextDirection = getDirection(r, c, ...iToP(stop));
            // direction = nextDirection;
            // current = pToI(...nextPoint);
        }

        return { railway: railway, stops: stops };
    }

    // const ONE_WAY = "□";
    const ONE_WAY = "█";

    // ─│┌┐└┘├┤┬┴┼
    const railCharMap = new Map();
    railCharMap.set(0, " "); // 0b0000
    railCharMap.set(1, ONE_WAY);
    railCharMap.set(2, ONE_WAY);
    railCharMap.set(3, "┌"); // 0b0011
    railCharMap.set(4, ONE_WAY);
    railCharMap.set(5, "│"); // 0b0101
    railCharMap.set(6, "└"); // 0b0110
    railCharMap.set(7, "├"); // 0b0111
    railCharMap.set(8, ONE_WAY);
    railCharMap.set(9, "┐"); // 0b1001
    railCharMap.set(10, "─"); // 0b1010
    railCharMap.set(11, "┬"); // 0b1011
    railCharMap.set(12, "┘"); // 0b1100
    railCharMap.set(13, "┤"); // 0b1101
    railCharMap.set(14, "┴"); // 0b1110
    railCharMap.set(15, "┼"); // 0b1111

    const directionCharMap = new Map();
    directionCharMap.set(0, "▼");
    directionCharMap.set(1, "►");
    directionCharMap.set(2, "▲");
    directionCharMap.set(3, "◄");

    const stationMap = new Map();
    // stationMap.set(" "); // 0b0000
    stationMap.set(ONE_WAY, "░");
    stationMap.set("┌", "╔"); // 0b0011
    stationMap.set("│", "║"); // 0b0101
    stationMap.set("└", "╚"); // 0b0110
    stationMap.set("├", "╠"); // 0b0111
    stationMap.set("┐", "╗"); // 0b1001
    stationMap.set("─", "═"); // 0b1010
    stationMap.set("┬", "╦"); // 0b1011
    stationMap.set("┘", "╝"); // 0b1100
    stationMap.set("┤", "╣"); // 0b1101
    stationMap.set("┴", "╩"); // 0b1110
    stationMap.set("┼", "╬"); // 0b1111

    // function getRailChar(from: number, to: number): string {
    //     const index = 1 << to | 1 << invertDirection(from);
    //     return railCharMap.get(index);
    // }

    const railwaysAndStops = Array(railwayCount).fill(null).map(_ => makeRailway(null, stopCount, mode));
    const railways = railwaysAndStops.map(v => v.railway);
    const stops = railwaysAndStops.map(v => v.stops);

    // const backgroundChars: string[][] = [];

    // for (let r = 0; r < rows; r++) {
    //     let line = [];
    //     for (let c = 0; c < cols; c++) {
    //         line.push(" ");
    //     }
    //     backgroundChars.push(line);
    // }

    const backgroundIndices: number[] = [];

    for (let i = 0; i < rows * cols; i++) {
        backgroundIndices[i] = 0;
    }

    for (const railway of railways) {
        for (let i = 0; i < railway.length; i++) {
            const v = railway[i];
            // const [r, c] = iToP(v.i);
            const last = i === 0 ? railway[railway.length - 1] : railway[i - 1];
            backgroundIndices[v.i] |= (1 << v.direction) | (1 << invertDirection(last.direction));
        }
    }

    let background = "";

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            background += railCharMap.get(backgroundIndices[pToI(r, c)]);
            // background += backgroundIndices[pToI(r, c)] !== 0 ? "X" : " ";
        }
        background += "\n";
    }

    for (const s of stops) {
        for (const stop of s) {
            const [r, c] = iToP(stop);
            const index = stop + r;
            background = background.slice(0, index) + stationMap.get(background[index]) + background.slice(index + 1);
        }
    }

    // let trains = railways.map(v => 0);

    interface Car {
        i: number,
        getChar: (direction: number) => string
    }

    function makeTrain(carCount: number, engineIndex: number, railwayLength: number) {
        const train: Car[] = [];
        train.push({
            i: engineIndex,
            getChar: (direction: number) => directionCharMap.get(direction),
        });

        function wrapIndex(i: number) {
            if (i < 0) return railwayLength + (i % railwayLength);
            return i % railwayLength;
        }

        const carChars: ((direction: number) => string)[] = ["■", "□", "▪", "▫"].map(c => (() => c));

        // ■□▪▫
        for (let i = 0; i < carCount; i++) {
            // console.log(i);
            train.push({
                i: wrapIndex(engineIndex - 1 - i),
                getChar: carChars[Math.floor(Math.random() * carChars.length)],
            });
        }

        return train;
    }

    let trains: Car[][] = [];

    for (const railway of railways) {
        let t: Car[] = [];
        for (let i = 0; i < trainCount; i++) {
            t = t.concat(makeTrain(
                Math.floor(Math.random() * 5) + 3,
                Math.floor(Math.random() * railway.length),
                railway.length,
            ));
        }
        trains.push(t);
    }

    let res: (value: unknown) => void;
    const promise = new Promise(resolve => res = resolve);

    function frame() {
        // requestAnimationFrame(frame);
        let render = background;
        for (let i = 0; i < railways.length; i++) {
            for (let j = 0; j < trains[i].length; j++) {
                const car = trains[i][j];
                const v = railways[i][car.i];
                const [r, c] = iToP(v.i);
                // console.log(JSON.stringify(render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1)));
                render = render.slice(0, v.i + r) + car.getChar(v.direction) + render.slice(v.i + r + 1);
                car.i++;
                if (car.i >= railways[i].length) {
                    car.i = 0;
                }
            }
            // const v = railways[i][trains[i]];
            // const [r, c] = iToP(v.i);
            // // console.log(JSON.stringify(render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1)));
            // render = render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1);
            // trains[i]++;
            // if (trains[i] >= railways[i].length) {
            //     trains[i] = 0;
            // }
        }
        api.current.clearOutput();
        api.current.pushOverEditable(render);
    }

    // interval = setInterval(frame, 50);

    function setFrameDelay(delay: number) {
        if (interval !== undefined && interval !== null) clearInterval(interval);
        interval = setInterval(frame, delay);
    };

    frame();

    setFrameDelay(1 / 24 * 1000);

    api.current.onChange = (output: string) => {
        const v = output.slice(api.current.outputState.editableIndex);
        api.current.setOutputState(state => ({
            ...state,
            output: state.output.slice(0, state.editableIndex),
        }));
        // api.current.setOutputState(state => {
        //     console.log(state);
        //     console.log(state.output.slice(state.editableIndex));
        //     return {
        //         ...state,
        //         output: state.output.slice(state.editableIndex),
        //     };
        // });
        const num = Number.parseInt(v);
        if (!Number.isNaN(num)) {
            const a = 0.56234132519;
            const b = 1.77827941004;
            const frameRate = a * Math.pow(b, num);
            setFrameDelay(1 / frameRate * 1000);
            return;
        }
        switch (v) {
            case "q":
                clearInterval(interval);
                res(null);
                break;
        }
    }

    return promise;
});

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
programs.set("rat", synchronousProgram((s, api) => {
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
    const wd = api.current.getEnv().workingDir;
    const res = wd.resolvePath(path);
    if (res === undefined) return "Not found.";
    if (res.type === "directory") return "Path is a directory.";
    const content: string = res.value.toString();
    const width = Math.max(...content.split("\n").map(l => l.length));
    return content + "\n" + "-".repeat(width) + `
    _QQ /
 ~~(__">`;
}));
programs.set("ls", synchronousProgram((s, api) => {
    const wd = api.current.getEnv().workingDir;
    // const dir = filesystem.resolvePath(wd);
    return stringifyPath(wd.path()) + " (" + wd.name + ")\n=== Directories ===\n\t" + [...wd.childDirectories.keys()].join("\n\t") + "\n=== Files ===\n\t" + [...wd.children.keys()].join("\n\t");
}));
programs.set("cd", synchronousProgram((s, api) => {
    // const path = s.split(" ").slice(1).join(" ").replace("\n", "").split("/").filter(v => v !== ".");
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
    if (path.length === 0) return "";
    // console.log(api.current.getEnv().current.workingDir);
    const filesystem = api.current.getFilesystem();
    const res = api.current.getEnv().workingDir.resolvePath(path);
    if (res === undefined) return "Path could not be resolved";
    if (res.type === "directory") {
        api.current.getEnv().workingDir = res.value;
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
}))

// https://w3c.github.io/input-events/#interface-InputEvent-Attributes
// deleteContent needs testing
const DELETE_BACKWARDS = ["deleteWordBackward", "deleteSoftLineBackward", "deleteHardLineBackward", "deleteContent", "deleteContentBackward"];

type Program = (input: string, api: React.MutableRefObject<API>) => Promise<any>;

interface API {
    pushBeforeEditable: (s: string) => any,
    pushOverEditable: (s: string) => any,
    clearOutput: () => any;
    // outputState: () => OutputState,
    setOutputState: React.Dispatch<React.SetStateAction<OutputState>>,
    outputState: OutputState,
    getFilesystem: () => Directory,
    getEnv: () => EnvironmentVariables,
    onLineBreak: (input: string) => any,
    onChange: (output: string) => any,
}

interface EnvironmentVariables {
    workingDir: Directory,
}

interface OutputState {
    output: string,
    editableIndex: number,
}

export default function App() {
    const envRef = React.useRef<EnvironmentVariables>({
        workingDir: filesystem,
    });

    function getPrompt() {
        // return "\nλ > ";
        return "\n" + stringifyPath(envRef.current.workingDir.path()) + " > ";
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
    // const inserting = React.useRef(false);
    const insertingLineBreak = React.useRef(false);
    const [state, setState] = React.useState<"shell" | "program">("shell");
    const apiRef = React.useRef<API>(null);
    apiRef.current = {
        pushBeforeEditable: pushBeforeEditable,
        pushOverEditable: pushOverEditable,
        setOutputState: setOutputState,
        outputState: outputState,
        clearOutput: clearOutput,
        getFilesystem: () => filesystem,
        getEnv: () => envRef.current,
        onLineBreak: apiRef.current?.onLineBreak ?? null,
        onChange: apiRef.current?.onChange ?? null,
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
            // console.log(newOutput.length);
            return {
                output: newOutput,
                editableIndex: newOutput.length,
            };
        });
    }

    function clearOutput() {
        setOutputState({
            output: "",
            editableIndex: 0,
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
        const programName = split[0];
        const program = programs.get(programName) ??
            apiRef.current.getEnv().workingDir.children.get(programName);
        if (program) {
            setState("program");
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
                insertingLineBreak.current = e.inputType === "insertLineBreak";
                // console.log(e.inputType);
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
    }, [textarea, outputState]);

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
                if (insertingLineBreak.current &&
                    !shiftDown.current &&
                    // newOutput.length !== 0 && 
                    // newOutput[newOutput.length - 1] === "\n" && 
                    e.target.selectionStart === newOutput.length) {
                    setOutputState(state => ({
                        output: newOutput,
                        editableIndex: newOutput.length,
                    }));
                    const input = newOutput.slice(outputState.editableIndex, newOutput.length - 1);
                    if (state === "shell") {
                        shell(input);
                    }
                    else if (state === "program") {
                        apiRef.current?.onLineBreak?.(input);
                    }
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
                if (state === "program") {
                    apiRef.current?.onChange?.(newOutput);
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
