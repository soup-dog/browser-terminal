import { synchronousProgram } from "./util";
import { arrayPath, sanitisePath } from "./Directory";

const cd = synchronousProgram((s, api) => {
    // const path = s.split(" ").slice(1).join(" ").replace("\n", "").split("/").filter(v => v !== ".");
    const path = arrayPath(sanitisePath(s.split(" ").slice(1).join(" ")));
    if (path.length === 0) return "";
    // console.log(api.current.getEnv().current.workingDir);
    const filesystem = api.current.getFilesystem();
    const res = api.current.getEnv().workingDir.resolvePath(path);
    if (res === undefined) return "Path could not be resolved";
    if (res.type === "directory") {
        api.current.getEnv().workingDir = res.value;
        return "";
    }
    return "Path resolves to a file.";
});

export default cd;