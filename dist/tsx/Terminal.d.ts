import * as React from "react";
import { Directory } from "../Directory";
import EnvironmentVariables from "../EnvironmentVariables";
import { Program } from "../Program";
interface TerminalProps extends React.HTMLAttributes<HTMLTextAreaElement> {
    programs: Map<string, Program>;
    filesystem: Directory;
    getPrompt?: (env: EnvironmentVariables) => string;
    initialState?: string;
}
export default function Terminal({ programs, filesystem, getPrompt, initialState, ...rest }: TerminalProps): React.JSX.Element;
export {};
