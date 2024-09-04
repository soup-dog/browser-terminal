import { simpleProgram } from "../util";

const box = simpleProgram((s: string) => {
    // ┌┐└┘ ─│
    console.log(JSON.stringify(s));
    const lines = s.split(" ").slice(1).join(" ").split("\n");
    const width = Math.max(...lines.map(l => l.length));
    console.log(lines);

    return "┌" + "─".repeat(width) + "┐\n" + lines.map(l => "│" + l + " ".repeat(width - l.length) + "│\n").join("") + "└" + "─".repeat(width) + "┘\n";
});

export default box;