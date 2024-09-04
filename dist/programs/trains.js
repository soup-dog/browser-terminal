var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { selectDefault, parseIntDefault } from "../util";
export default function trains(s, api) {
    return __awaiter(this, void 0, void 0, function* () {
        // ─│┌┐└┘├┤┬┴┼
        const params = s.split(" ").slice(1);
        if (params[0] === "help" || params[0] === "-h") {
            api.current.pushOverEditable("Model trains.\nUsage: trains <mode: normal|serious|silly|batshit> <railway count> <stop count> <train count> <rows> <cols>");
            return;
        }
        const mode = selectDefault(params[0], ["normal", "serious", "silly", "batshit"], "normal");
        const railwayCount = parseIntDefault(params[1], 3);
        const stopCount = parseIntDefault(params[2], 3);
        const trainCount = parseIntDefault(params[3], 3);
        const rows = parseIntDefault(params[4], 64);
        const cols = parseIntDefault(params[5], 64);
        let interval;
        function pToI(r, c) {
            return cols * r + c;
        }
        function iToP(i) {
            return [Math.floor(i / cols), i % cols];
        }
        function wrapP(r, c) {
            const point = [r, c];
            if (point[0] >= rows)
                point[0] = 0;
            if (point[0] < 0)
                point[0] = rows - 1;
            if (point[1] >= cols)
                point[1] = 0;
            if (point[1] < 0)
                point[1] = cols - 1;
            return point;
        }
        function getOffset(direction) {
            switch (direction) {
                case 0: // +r
                    return [1, 0];
                case 1: // +c
                    return [0, 1];
                case 2: // -r
                    return [-1, 0];
                case 3: // -c
                    return [0, -1];
            }
        }
        function rotateDirection(direction, steps) {
            // let newDirection = (direction + steps) % 4;
            // if (newDirection < 0) newDirection = 4 + newDirection;
            // return newDirection;
            return (direction + steps) & 0b11;
        }
        function invertDirection(direction) {
            return direction ^ 0b10;
        }
        function getDirection(fromR, fromC, toR, toC) {
            const deltaR = toR - fromR;
            const deltaC = toC - fromC;
            if (Math.abs(deltaR) >= Math.abs(deltaC)) {
                return deltaR > 0 ? 0 : 2;
            }
            else {
                return deltaC > 0 ? 1 : 3;
            }
        }
        // function makeRailway() {
        //     let origin = Math.floor(Math.random() * rows * cols);
        //     let current = origin;
        //     let currentDirection = Math.floor(Math.random() * 4);
        //     const railway: { i: number, direction: number }[] = [];
        //     while (current !== origin || railway.length === 0) {
        //         // currentDirection = currentDirection + Math.floor(Math.random() * 3) - 1;
        //         // console.log(currentDirection);
        //         // if (currentDirection > 3) currentDirection = 0;
        //         // if (currentDirection < 0) currentDirection = 3;
        //         const nextDirection = rotateDirection(currentDirection, Math.floor(Math.random() * 3) - 1);
        //         const currentPoint = iToP(current);
        //         const offset = getOffset(nextDirection);
        //         const nextPoint = [currentPoint[0] + offset[0], currentPoint[1] + offset[1]];
        //         // console.log(currentPoint);
        //         // console.log(nextPoint);
        //         if (nextPoint[0] >= rows) nextPoint[0] = 0;
        //         if (nextPoint[0] < 0) nextPoint[0] = rows - 1;
        //         if (nextPoint[1] >= cols) nextPoint[1] = 0;
        //         if (nextPoint[1] < 0) nextPoint[1] = cols - 1;
        //         const nextIndex = pToI(nextPoint[0], nextPoint[1]);
        //         if (railway.length !== 0 &&
        //             nextIndex === origin &&
        //             railway[0].direction === nextDirection) continue;
        //         currentDirection = nextDirection;
        //         railway.push({ i: current, direction: currentDirection });
        //         current = nextIndex;
        //     }
        //     return railway;
        // }
        function makeRailway(stops = null, stopCount = 3, mode = "normal") {
            if (!stops) {
                stops = [];
                for (let i = 0; i < stopCount; i++) {
                    stops.push(Math.floor(Math.random() * rows * cols));
                }
            }
            const railway = [];
            let current = stops[0];
            let direction = 0;
            let stopIndex = 1;
            while (true) {
                if (current === stops[stopIndex]) {
                    if (stopIndex === 0) {
                        break;
                    }
                    stopIndex++;
                }
                const stop = stops[stopIndex];
                const [r, c] = iToP(current);
                const currentPoint = iToP(current);
                const lastDirection = direction;
                switch (mode) {
                    case "normal":
                        // move in optimal direction with 1/4 chance to rotate in either direction
                        direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 1.5 + 0.75) - 1);
                        break;
                    case "serious":
                        direction = getDirection(r, c, ...iToP(stop));
                        break;
                    case "silly":
                        direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 2 + 0.5) - 1);
                        break;
                    case "batshit":
                        direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
                        break;
                }
                if (direction === invertDirection(lastDirection)) { // try not to do a 180 
                    direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
                }
                // // move in optimal direction with 1/4 chance to rotate in either direction
                // direction = getDirection(r, c, ...iToP(stop));
                // // direction = rotateDirection(getDirection(r, c, ...iToP(stop)), Math.floor(Math.random() * 2 + 0.5) - 1);
                // // if (direction === invertDirection(lastDirection)) { // try not to do a 180 
                // //     direction = rotateDirection(direction, Math.floor(Math.random() * 3) - 1);
                // // }
                railway.push({
                    i: current,
                    direction: direction,
                });
                const offset = getOffset(direction);
                const nextPoint = wrapP(currentPoint[0] + offset[0], currentPoint[1] + offset[1]);
                current = pToI(...nextPoint);
                if (stopIndex >= stops.length) {
                    stopIndex = 0;
                }
                // const [r, c] = iToP(current);
                // const currentPoint = iToP(current);
                // const offset = getOffset(direction);
                // const nextPoint = wrapP(currentPoint[0] + offset[0], currentPoint[1] + offset[1]);
                // const nextDirection = getDirection(r, c, ...iToP(stop));
                // direction = nextDirection;
                // current = pToI(...nextPoint);
            }
            return { railway: railway, stops: stops };
        }
        // const ONE_WAY = "□";
        const ONE_WAY = "█";
        // ─│┌┐└┘├┤┬┴┼
        const railCharMap = new Map();
        railCharMap.set(0, " "); // 0b0000
        railCharMap.set(1, ONE_WAY);
        railCharMap.set(2, ONE_WAY);
        railCharMap.set(3, "┌"); // 0b0011
        railCharMap.set(4, ONE_WAY);
        railCharMap.set(5, "│"); // 0b0101
        railCharMap.set(6, "└"); // 0b0110
        railCharMap.set(7, "├"); // 0b0111
        railCharMap.set(8, ONE_WAY);
        railCharMap.set(9, "┐"); // 0b1001
        railCharMap.set(10, "─"); // 0b1010
        railCharMap.set(11, "┬"); // 0b1011
        railCharMap.set(12, "┘"); // 0b1100
        railCharMap.set(13, "┤"); // 0b1101
        railCharMap.set(14, "┴"); // 0b1110
        railCharMap.set(15, "┼"); // 0b1111
        const directionCharMap = new Map();
        directionCharMap.set(0, "▼");
        directionCharMap.set(1, "►");
        directionCharMap.set(2, "▲");
        directionCharMap.set(3, "◄");
        const stationMap = new Map();
        // stationMap.set(" "); // 0b0000
        stationMap.set(ONE_WAY, "░");
        stationMap.set("┌", "╔"); // 0b0011
        stationMap.set("│", "║"); // 0b0101
        stationMap.set("└", "╚"); // 0b0110
        stationMap.set("├", "╠"); // 0b0111
        stationMap.set("┐", "╗"); // 0b1001
        stationMap.set("─", "═"); // 0b1010
        stationMap.set("┬", "╦"); // 0b1011
        stationMap.set("┘", "╝"); // 0b1100
        stationMap.set("┤", "╣"); // 0b1101
        stationMap.set("┴", "╩"); // 0b1110
        stationMap.set("┼", "╬"); // 0b1111
        // function getRailChar(from: number, to: number): string {
        //     const index = 1 << to | 1 << invertDirection(from);
        //     return railCharMap.get(index);
        // }
        const railwaysAndStops = Array(railwayCount).fill(null).map(_ => makeRailway(null, stopCount, mode));
        const railways = railwaysAndStops.map(v => v.railway);
        const stops = railwaysAndStops.map(v => v.stops);
        // const backgroundChars: string[][] = [];
        // for (let r = 0; r < rows; r++) {
        //     let line = [];
        //     for (let c = 0; c < cols; c++) {
        //         line.push(" ");
        //     }
        //     backgroundChars.push(line);
        // }
        const backgroundIndices = [];
        for (let i = 0; i < rows * cols; i++) {
            backgroundIndices[i] = 0;
        }
        for (const railway of railways) {
            for (let i = 0; i < railway.length; i++) {
                const v = railway[i];
                // const [r, c] = iToP(v.i);
                const last = i === 0 ? railway[railway.length - 1] : railway[i - 1];
                backgroundIndices[v.i] |= (1 << v.direction) | (1 << invertDirection(last.direction));
            }
        }
        let background = "";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                background += railCharMap.get(backgroundIndices[pToI(r, c)]);
                // background += backgroundIndices[pToI(r, c)] !== 0 ? "X" : " ";
            }
            background += "\n";
        }
        for (const s of stops) {
            for (const stop of s) {
                const [r, c] = iToP(stop);
                const index = stop + r;
                background = background.slice(0, index) + stationMap.get(background[index]) + background.slice(index + 1);
            }
        }
        function makeTrain(carCount, engineIndex, railwayLength) {
            const train = [];
            train.push({
                i: engineIndex,
                getChar: (direction) => directionCharMap.get(direction),
            });
            function wrapIndex(i) {
                if (i < 0)
                    return railwayLength + (i % railwayLength);
                return i % railwayLength;
            }
            const carChars = ["■", "□", "▪", "▫"].map(c => (() => c));
            // ■□▪▫
            for (let i = 0; i < carCount; i++) {
                // console.log(i);
                train.push({
                    i: wrapIndex(engineIndex - 1 - i),
                    getChar: carChars[Math.floor(Math.random() * carChars.length)],
                });
            }
            return train;
        }
        let trains = [];
        for (const railway of railways) {
            let t = [];
            for (let i = 0; i < trainCount; i++) {
                t = t.concat(makeTrain(Math.floor(Math.random() * 5) + 3, Math.floor(Math.random() * railway.length), railway.length));
            }
            trains.push(t);
        }
        let res;
        const promise = new Promise(resolve => res = resolve);
        function frame() {
            // requestAnimationFrame(frame);
            let render = background;
            for (let i = 0; i < railways.length; i++) {
                for (let j = 0; j < trains[i].length; j++) {
                    const car = trains[i][j];
                    const v = railways[i][car.i];
                    const [r, c] = iToP(v.i);
                    // console.log(JSON.stringify(render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1)));
                    render = render.slice(0, v.i + r) + car.getChar(v.direction) + render.slice(v.i + r + 1);
                    car.i++;
                    if (car.i >= railways[i].length) {
                        car.i = 0;
                    }
                }
                // const v = railways[i][trains[i]];
                // const [r, c] = iToP(v.i);
                // // console.log(JSON.stringify(render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1)));
                // render = render.slice(0, v.i + r) + directionCharMap.get(v.direction) + render.slice(v.i + r + 1);
                // trains[i]++;
                // if (trains[i] >= railways[i].length) {
                //     trains[i] = 0;
                // }
            }
            api.current.clearOutput();
            api.current.pushOverEditable(render);
        }
        // interval = setInterval(frame, 50);
        function setFrameDelay(delay) {
            if (interval !== undefined && interval !== null)
                clearInterval(interval);
            interval = setInterval(frame, delay);
        }
        ;
        frame();
        setFrameDelay(1 / 24 * 1000);
        api.current.onChange = (output) => {
            const v = output.slice(api.current.outputState.editableIndex);
            api.current.setOutputState(state => (Object.assign(Object.assign({}, state), { output: state.output.slice(0, state.editableIndex) })));
            // api.current.setOutputState(state => {
            //     console.log(state);
            //     console.log(state.output.slice(state.editableIndex));
            //     return {
            //         ...state,
            //         output: state.output.slice(state.editableIndex),
            //     };
            // });
            const num = Number.parseInt(v);
            if (!Number.isNaN(num)) {
                const a = 0.56234132519;
                const b = 1.77827941004;
                const frameRate = a * Math.pow(b, num);
                setFrameDelay(1 / frameRate * 1000);
                return;
            }
            switch (v) {
                case "q":
                    clearInterval(interval);
                    res(null);
                    break;
            }
        };
        return promise;
    });
}
