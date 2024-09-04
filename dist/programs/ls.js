"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const Directory_1 = require("../Directory");
const ls = (0, util_1.synchronousProgram)((s, api) => {
    const wd = api.current.getEnv().workingDir;
    // const dir = filesystem.resolvePath(wd);
    return (0, Directory_1.stringifyPath)(wd.path()) + " (" + wd.name + ")\n=== Directories ===\n\t" + [...wd.childDirectories.keys()].join("\n\t") + "\n=== Files ===\n\t" + [...wd.children.keys()].join("\n\t");
});
exports.default = ls;
