var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function parseIntDefault(s, _default) {
    if (s === undefined || s === null)
        return _default;
    const num = Number.parseInt(s);
    return Number.isNaN(num) ? _default : num;
}
export function selectDefault(s, options, _default) {
    if (s === undefined || s === null)
        return _default;
    if (options.includes(s))
        return s;
    return _default;
}
export function simpleProgram(program) {
    return (input, api) => __awaiter(this, void 0, void 0, function* () {
        api.current.pushOverEditable(program(input));
    });
}
export function synchronousProgram(program) {
    return (input, api) => __awaiter(this, void 0, void 0, function* () {
        api.current.pushOverEditable(program(input, api));
    });
}
