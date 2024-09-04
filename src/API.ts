import { Directory } from "./Directory";
import EnvironmentVariables from "./EnvironmentVariables";

export default interface API {
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