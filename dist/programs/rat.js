"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const Directory_1 = require("../Directory");
const rat = (0, util_1.synchronousProgram)((s, api) => {
    const path = (0, Directory_1.arrayPath)((0, Directory_1.sanitisePath)(s.split(" ").slice(1).join(" ")));
    const wd = api.current.getEnv().workingDir;
    const res = wd.resolvePath(path);
    if (res === undefined)
        return "Not found.";
    if (res.type === "directory")
        return "Path is a directory.";
    const content = res.value.toString();
    const width = Math.max(...content.split("\n").map(l => l.length));
    return content + "\n" + "-".repeat(width) + `
    _QQ /
 ~~(__">`;
});
exports.default = rat;
