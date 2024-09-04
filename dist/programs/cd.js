"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const Directory_1 = require("../Directory");
const cd = (0, util_1.synchronousProgram)((s, api) => {
    // const path = s.split(" ").slice(1).join(" ").replace("\n", "").split("/").filter(v => v !== ".");
    const path = (0, Directory_1.arrayPath)((0, Directory_1.sanitisePath)(s.split(" ").slice(1).join(" ")));
    if (path.length === 0)
        return "";
    // console.log(api.current.getEnv().current.workingDir);
    const filesystem = api.current.getFilesystem();
    const res = api.current.getEnv().workingDir.resolvePath(path);
    if (res === undefined)
        return "Path could not be resolved";
    if (res.type === "directory") {
        api.current.getEnv().workingDir = res.value;
        return "";
    }
    return "Path resolves to a file.";
});
exports.default = cd;
