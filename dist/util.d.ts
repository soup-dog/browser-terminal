import API from "./API";
export declare function parseIntDefault(s: string, _default: number): number;
export declare function selectDefault(s: string, options: string[], _default: string): string;
export declare function simpleProgram(program: (input: string) => string): (input: string, api: React.MutableRefObject<API>) => Promise<void>;
export declare function synchronousProgram(program: (input: string, api: React.MutableRefObject<API>) => string): (input: string, api: React.MutableRefObject<API>) => Promise<void>;
