var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default function guesser(input, api) {
    return __awaiter(this, void 0, void 0, function* () {
        function getInput() {
            return new Promise((resolve) => api.current.onLineBreak = resolve);
        }
        const max = 10;
        const num = Math.floor(Math.random() * max) + 1;
        api.current.pushOverEditable("I'm thinking of a number between 1 and " + max.toString() + ". Try to guess it!");
        while (true) {
            api.current.pushOverEditable("\n>>> ");
            const rawInput = yield getInput();
            const numberInput = Number.parseInt(rawInput);
            if (Number.isNaN(numberInput)) {
                api.current.pushBeforeEditable("That's not a number!");
            }
            else if (num > numberInput) {
                api.current.pushOverEditable("Higher...");
            }
            else if (num < numberInput) {
                api.current.pushOverEditable("Lower...");
            }
            else {
                break;
            }
        }
        api.current.pushOverEditable("You guessed the number!");
    });
}
//# sourceMappingURL=guesser.js.map