import { synchronousProgram } from "../../util";
import { stringifyPath } from "../Directory";

const ls = synchronousProgram((s, api) => {
    const wd = api.current.getEnv().workingDir;
    // const dir = filesystem.resolvePath(wd);
    return stringifyPath(wd.path()) + " (" + wd.name + ")\n=== Directories ===\n\t" + [...wd.childDirectories.keys()].join("\n\t") + "\n=== Files ===\n\t" + [...wd.children.keys()].join("\n\t");
});

export default ls;