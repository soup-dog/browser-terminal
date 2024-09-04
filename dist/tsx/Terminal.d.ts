import * as React from "react";
import { Directory } from "../Directory";
import EnvironmentVariables from "../EnvironmentVariables";
import { Program } from "../Program";
export default function Terminal({ programs, filesystem, getPrompt, initialState }: {
    programs: Map<string, Program>;
    filesystem: Directory;
    getPrompt?: (env: EnvironmentVariables) => string;
    initialState?: string;
}): React.JSX.Element;
