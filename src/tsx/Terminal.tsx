import * as React from "react";
import { Directory, stringifyPath } from "../Directory";
import EnvironmentVariables from "../EnvironmentVariables";
import API from "../API";
import { Program } from "../Program";
import OutputState from "../OutputState";


// https://w3c.github.io/input-events/#interface-InputEvent-Attributes
// deleteContent needs testing
const DELETE_BACKWARDS = ["deleteWordBackward", "deleteSoftLineBackward", "deleteHardLineBackward", "deleteContent", "deleteContentBackward"];

export default function Terminal({ programs, filesystem }: { programs: Map<string, Program>, filesystem: Directory }) {
    const envRef = React.useRef<EnvironmentVariables>({
        workingDir: filesystem,
    });

    function getPrompt() {
        return "\n" + stringifyPath(envRef.current.workingDir.path()) + " > ";
    }

    // const [output, setOutput] = React.useState("Hello world!\nWelcome to Shiterminal!\n" + getPrompt());
    const [outputState, setOutputState] = React.useState<OutputState>(() => {
        const s = "Browser Terminal\n" + getPrompt();
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
            spellCheck={false}
        >

        </textarea>
    );
}