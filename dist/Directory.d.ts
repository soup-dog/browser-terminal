export declare enum AddReturnCode {
    OK = 0,
    AlreadyExists = 1,
    HasParent = 2
}
export declare function isAbsolute(path: string[]): boolean;
export declare function stringifyPath(path: string[]): string;
export declare function sanitisePath(path: string): string;
export declare function arrayPath(path: string): string[];
type File = any;
export declare class Directory {
    name: string;
    parent: Directory | null;
    childDirectories: Map<string, Directory>;
    children: Map<string, File>;
    constructor(name?: string);
    static fromObject(data: any, name?: string): Directory;
    addDirectory(directory: Directory): AddReturnCode;
    removeDirectory(directory: Directory): void;
    path(path?: string[]): string[];
    resolvePath(path: string[]): {
        type: "directory" | "file";
        value: Directory | File;
    };
    root(): Directory;
}
export {};
