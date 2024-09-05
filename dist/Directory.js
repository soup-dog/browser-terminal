"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Directory = exports.AddReturnCode = void 0;
exports.isAbsolute = isAbsolute;
exports.stringifyPath = stringifyPath;
exports.sanitisePath = sanitisePath;
exports.arrayPath = arrayPath;
var AddReturnCode;
(function (AddReturnCode) {
    AddReturnCode[AddReturnCode["OK"] = 0] = "OK";
    AddReturnCode[AddReturnCode["AlreadyExists"] = 1] = "AlreadyExists";
    AddReturnCode[AddReturnCode["HasParent"] = 2] = "HasParent";
})(AddReturnCode || (exports.AddReturnCode = AddReturnCode = {}));
function isAbsolute(path) {
    return path[0] === "";
}
function stringifyPath(path) {
    if (path.length === 0)
        return "";
    if (isAbsolute(path)) {
        if (path.length === 1)
            return "/";
    }
    return path.join("/");
}
function sanitisePath(path) {
    return path.replace("\n", "");
}
function arrayPath(path) {
    return path.split("/");
}
class Directory {
    constructor(name = "") {
        this.name = "";
        this.parent = null;
        this.childDirectories = new Map();
        this.children = new Map();
        this.name = name;
    }
    static fromObject(data, name = undefined) {
        const directory = new Directory(name);
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
    addDirectory(directory) {
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
    removeDirectory(directory) {
        this.childDirectories.delete(directory.name);
        directory.parent = null;
    }
    path(path = []) {
        path.unshift(this.name);
        if (this.parent) {
            this.parent.path(path);
        }
        return path;
    }
    resolvePath(path) {
        var _a;
        if (isAbsolute(path)) {
            if (this.parent) {
                return this.root().resolvePath(path);
            }
            path = path.slice(1);
        }
        let current = this;
        for (let i = 0; i < path.length; i++) {
            const dir = path[i];
            if (dir === ".")
                continue;
            if (dir === "..") {
                current = (_a = current.parent) !== null && _a !== void 0 ? _a : current;
                continue;
            }
            const next = current.childDirectories.get(dir);
            if (next === undefined) {
                if (i === path.length - 1) {
                    const file = current.children.get(dir);
                    return file === undefined ?
                        undefined : {
                        type: "file",
                        value: file,
                    };
                }
                return undefined;
            }
            current = next;
        }
        return {
            type: "directory",
            value: current,
        };
    }
    root() {
        if (this.parent) {
            return this.parent.root();
        }
        return this;
    }
}
exports.Directory = Directory;
