"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Terminal;
const React = require("react");
const Directory_1 = require("../Directory");
// https://w3c.github.io/input-events/#interface-InputEvent-Attributes
// deleteContent needs testing
const DELETE_BACKWARDS = ["deleteWordBackward", "deleteSoftLineBackward", "deleteHardLineBackward", "deleteContent", "deleteContentBackward"];
function Terminal(_a) {
    var _b, _c, _d, _e;
    var { programs, filesystem, getPrompt = env => "\n" + (0, Directory_1.stringifyPath)(env.workingDir.path()) + " > ", initialState = "Browser Terminal\n" } = _a, rest = __rest(_a, ["programs", "filesystem", "getPrompt", "initialState"]);
    const envRef = React.useRef({
        workingDir: filesystem,
    });
    // function getPrompt() {
    //     return "\n" + stringifyPath(envRef.current.workingDir.path()) + " > ";
    // }
    // const [output, setOutput] = React.useState("Hello world!\nWelcome to Shiterminal!\n" + getPrompt());
    const [outputState, setOutputState] = React.useState(() => {
        const s = initialState + getPrompt(envRef.current);
        return {
            output: s,
            editableIndex: s.length,
        };
    });
    // const [selection, setSelection] = React.useState<[number | null, number | null] | null>(null);
    // const realStart = React.useRef(null);
    // const realSelection = React.useRef<[number | null, number | null] | null>([0, 0]);
    const textarea = React.useRef(null);
    // const [editableIndex, setEditableIndex] = React.useState(output.length);
    const shiftDown = React.useRef(false);
    // const inserting = React.useRef(false);
    const insertingLineBreak = React.useRef(false);
    const [state, setState] = React.useState("shell");
    const apiRef = React.useRef(null);
    apiRef.current = {
        pushBeforeEditable: pushBeforeEditable,
        pushOverEditable: pushOverEditable,
        setOutputState: setOutputState,
        outputState: outputState,
        clearOutput: clearOutput,
        getFilesystem: () => filesystem,
        getEnv: () => envRef.current,
        onLineBreak: (_c = (_b = apiRef.current) === null || _b === void 0 ? void 0 : _b.onLineBreak) !== null && _c !== void 0 ? _c : null,
        onChange: (_e = (_d = apiRef.current) === null || _d === void 0 ? void 0 : _d.onChange) !== null && _e !== void 0 ? _e : null,
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
    function pushBeforeEditable(s) {
        setOutputState(state => {
            // console.log(state.output.slice(0, state.editableIndex));
            // console.log(state.output.slice(state.editableIndex));
            return {
                output: state.output.slice(0, state.editableIndex) + s + state.output.slice(state.editableIndex),
                editableIndex: state.editableIndex + s.length,
            };
        });
    }
    function pushOverEditable(s) {
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
        setOutputState(state => (Object.assign(Object.assign({}, state), { editableIndex: state.output.length })));
    }
    // const api = {
    //     pushBeforeEditable: pushBeforeEditable,
    //     pushOverEditable: pushOverEditable,
    //     setOutputState: setOutputState,
    // }
    function shell(input) {
        var _a;
        const split = input.split(" ");
        if (split.length === 0)
            return;
        const programName = split[0];
        const program = (_a = programs.get(programName)) !== null && _a !== void 0 ? _a : apiRef.current.getEnv().workingDir.children.get(programName);
        if (program) {
            setState("program");
            program(input, apiRef).then(() => {
                setState("shell");
                pushOverEditable(getPrompt(envRef.current));
            });
        }
        else if (input === "") {
            pushBeforeEditable(getPrompt(envRef.current));
        }
        else {
            pushOverEditable(input + " is not a program." + getPrompt(envRef.current));
        }
    }
    // React.useEffect(() => {
    //     if (selection && textarea.current) {
    //         [textarea.current.selectionStart, textarea.current.selectionEnd] = selection;
    //     }
    // }, [selection]);
    React.useEffect(() => {
        if (textarea.current) {
            const capturedTextarea = textarea.current;
            const onBeforeInput = (e) => {
                insertingLineBreak.current = e.inputType === "insertLineBreak";
                // console.log(e.inputType);
                if (e.inputType === "deleteEntireSoftLine") {
                    // TODO: handle this properly, this should only not work on a line with non-editable content
                    e.preventDefault();
                    return;
                }
                const element = e.target;
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
            capturedTextarea.addEventListener("beforeinput", onBeforeInput);
            return () => capturedTextarea.removeEventListener("beforeinput", onBeforeInput);
        }
    }, [textarea, outputState]);
    return (React.createElement("textarea", Object.assign({ 
        // onSelect={(e) => {
        //     const element = (e.target as HTMLTextAreaElement);
        //     // realStart.current = (e.target as HTMLTextAreaElement).selectionStart;
        //     realSelection.current = [element.selectionStart, element.selectionEnd];
        //     // console.log(realStart.current);
        // }}
        ref: textarea, value: outputState.output, onChange: e => {
            var _a, _b, _c, _d;
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
                    (_b = (_a = apiRef.current) === null || _a === void 0 ? void 0 : _a.onLineBreak) === null || _b === void 0 ? void 0 : _b.call(_a, input);
                }
                // setOutputState(state => ({
                //     ...state,
                //     output: state + shell(newOutput.slice(state.editableIndex, newOutput.length - 1)),
                // }));
            }
            else {
                setOutputState(state => (Object.assign(Object.assign({}, state), { output: newOutput })));
            }
            if (state === "program") {
                (_d = (_c = apiRef.current) === null || _c === void 0 ? void 0 : _c.onChange) === null || _d === void 0 ? void 0 : _d.call(_c, newOutput);
            }
        }, onKeyDown: e => {
            if (e.key === "Shift") {
                shiftDown.current = true;
            }
        }, onKeyUp: e => {
            if (e.key === "Shift") {
                shiftDown.current = false;
            }
        }, spellCheck: false }, rest)));
}
