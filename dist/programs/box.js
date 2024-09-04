"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const box = (0, util_1.simpleProgram)((s) => {
    // ┌┐└┘ ─│
    console.log(JSON.stringify(s));
    const lines = s.split(" ").slice(1).join(" ").split("\n");
    const width = Math.max(...lines.map(l => l.length));
    console.log(lines);
    return "┌" + "─".repeat(width) + "┐\n" + lines.map(l => "│" + l + " ".repeat(width - l.length) + "│\n").join("") + "└" + "─".repeat(width) + "┘\n";
});
exports.default = box;
