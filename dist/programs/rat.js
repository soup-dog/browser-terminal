import { synchronousProgram } from "../util";
import { arrayPath, sanitisePath } from "../Directory";
const rat = synchronousProgram((s, api) => {
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
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
export default rat;
