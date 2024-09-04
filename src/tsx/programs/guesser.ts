import API from "../API";

export default async function guesser(input: string, api: React.MutableRefObject<API>) {
    function getInput() {
        return new Promise((resolve: (v: string) => any) => api.current.onLineBreak = resolve);
    }

    const max = 10;

    const num = Math.floor(Math.random() * max) + 1;

    api.current.pushOverEditable("I'm thinking of a number between 1 and " + max.toString() + ". Try to guess it!");

    while (true) {
        api.current.pushOverEditable("\n>>> ");
        const rawInput = await getInput();
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
}
