export enum AddReturnCode {
    OK,
    AlreadyExists,
    HasParent,
}

export function isAbsolute(path: string[]) {
    return path[0] === "";
}

export function stringifyPath(path: string[]): string {
    if (path.length === 0) return "";
    if (isAbsolute(path)) {
        if (path.length === 1) return "/";
    }
    return path.join("/");
}

export function sanitisePath(path: string): string {
    return path.replace("\n", "");
}

export function arrayPath(path: string): string[] {
    return path.split("/");
}

type File = any;

export class Directory {
    public name: string = "";
    public parent: Directory | null = null;
    public childDirectories: Map<string, Directory> = new Map();
    public children: Map<string, File> = new Map();

    constructor(name: string = "") {
        this.name = name;
    }

    static fromObject(data: any, name: string = undefined): Directory {
        const directory: Directory = new Directory(name);

        for (const entry of Object.entries(data)) {
            const [name, content] = entry;
            if (content instanceof Object) {
                directory.addDirectory(Directory.fromObject(content, name));
            }
            else {
                directory.children.set(name, content);
            }
        }

        return directory;
    }

    addDirectory(directory: Directory) {
        if (directory.parent) {
            return AddReturnCode.HasParent;
        }
        if (this.childDirectories.has(directory.name)) {
            return AddReturnCode.AlreadyExists;
        }
        this.childDirectories.set(directory.name, directory);
        directory.parent = this;
        return AddReturnCode.OK;
    }

    removeDirectory(directory: Directory) {
        this.childDirectories.delete(directory.name);
        directory.parent = null;
    }

    path(path: string[] = []): string[] {
        path.unshift(this.name);
        if (this.parent) {
            this.parent.path(path);
        }
        return path;
    }

    resolvePath(path: string[]): Directory | File {
        if (isAbsolute(path)) {
            if (this.parent) {
                return this.root().resolvePath(path);
            }
            path = path.slice(1);
        }

        let current: Directory = this;
        
        for (let i = 0; i < path.length; i++) {
            const dir = path[i];
            if (dir === ".") continue;
            if (dir === "..") {
                current = current.parent ?? current;
                continue;
            }
            const next = current.childDirectories.get(dir);
            if (next === undefined) {
                if (i === path.length - 1) {
                    return current.children.get(dir);
                }
                return undefined;
            }
            current = next;
        }

        return current;
    }

    root(): Directory {
        if (this.parent) {
            return this.parent.root();
        }
        return this;
    }

    // addFile(name: string, content: any) {
    //     if (this.children.has(name)) {
    //         return AddReturnCode.AlreadyExists;
    //     }
    //     this.children.set(name, content);
    //     return AddReturnCode.OK;
    // }
}