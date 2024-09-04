import API from "./tsx/API";

export function parseIntDefault(s: string, _default: number): number {
    if (s === undefined || s === null) return _default;
    const num = Number.parseInt(s);
    return Number.isNaN(num) ? _default : num;
}

export function selectDefault(s: string, options: string[], _default: string): string {
    if (s === undefined || s === null) return _default;
    if (options.includes(s)) return s;
    return _default;
}

export function simpleProgram(program: (input: string) => string) {
    return async (input: string, api: React.MutableRefObject<API>) => {
        api.current.pushOverEditable(program(input));
    };
}

export function synchronousProgram(program: (input: string, api: React.MutableRefObject<API>) => string) {
    return async (input: string, api: React.MutableRefObject<API>) => {
        api.current.pushOverEditable(program(input, api));
    };
}
