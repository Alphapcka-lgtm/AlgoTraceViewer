import LZString from "lz-string";
import type {ExportState, PseudoCodeLine} from "./Types.tsx";
import type {PointPair, ClosestPairStepType, Point} from "../closestPair/shared/Types.tsx"

export const SVG_WIDTH = 1123;
export const SVG_HEIGHT = 500;

function encodeUsingChars(i: number, chars: string): string {
    const base = chars.length;
    let result = "";
    do {
        result = chars.charAt(i % base) + result;
        i = Math.floor(i / base);
    } while (i > 0);
    return result;
}

export function getRandomId(): string{
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return encodeUsingChars(Math.floor(Date.now() * Math.random()), chars + chars.toUpperCase());
}




//0  -> A, 1  -> B, ..., 25 -> Z, 26 -> AA, 27 -> AB
export function getAlphabetLabel(i: number): string {
    let result: string = "";
    let current: number = i;
    while (current >= 0) {
        const rest = current % 26;
        const char = String.fromCharCode(65 + rest);
        result = char + result;
        current = Math.floor(current / 26) - 1;
    }
    return result;
}

/*
alle vorhandenen lables werden überschrieben, sodass wenn nodes gelöscht wurden keine "beschriftungslücken"
gibt. Das wird gemacht before die nodes ans backend geschicket werden...
label werden nur für anzeige und explanations benutzt... deshalb gibt es noch node id
 */
export function assignLabels(points: Point[]): Point[] {
    return points.map((point, index) => ({...point, label: getAlphabetLabel(index)}));
}



export function getStepIndexFromTimeline(tl: gsap.core.Timeline, labels: string[]): number {
    const currTime = tl.time();

    let stepIndex = 0;

    for (let i = 0; i < labels.length; i++) {
        const labelTime = tl.labels[labels[i]];
        // console.log(labelTime);
        if (labelTime <= currTime + 0.0001) {
            stepIndex = i;
        } else {
            break;
        }
    }

    return stepIndex;
}

export function encodeExportState(state: ExportState): string {
    return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}

export function decodeExportState(encoded: string): ExportState {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (json === null) throw new Error("Invalid export string");
    return JSON.parse(json) as ExportState;
}

export function createStepLabels(stepCount: number): string[] {
    return Array.from({length: stepCount}, (_, i) => String(i));
}

const createRandomPoint = (padding: number, svgWidth:number, svgHeight:number): Point => {
    const minX = padding;
    const maxX = svgWidth - padding;
    const minY = padding;
    const maxY = svgHeight - padding;
    return {
        id: getRandomId(),
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        label: "",
    };
};

export const createRandomPoints = (count: number, padding: number, svgWidth:number, svgHeight:number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
        points.push(createRandomPoint(padding, svgWidth, svgHeight));
    }
    return points;
};

export function getActivePseudoCodeLineIds(stepType: ClosestPairStepType): string[] {
    switch (stepType) {
        case "START": return [];
        case "INITIALIZATION": return ["sort", "init"];
        case "ADVANCE_AND_PRUNE": return ["set-current", "remove-inactive"];
        case "CHECK_CANDIDATES": return ["candidate-window", "check-distance"];
        case "COMMIT_ITERATION":return ["update-best", "insert-current"];
        case "FINISHED": return ["return"];
    }
}

export const SWEEP_LINE_PSEUDOCODE: PseudoCodeLine[] = [
    {id: "sort", text: "p ← points sorted by x-coordinate" //text: "sort points by x; initialize bestPair and δ"
    },
    {id: "init", text: "initialize closestPair, δ and activeSet with p[0], p[1]"
    },
    {id: "for-loop", text: "for i ← 2 to |p| − 1 do"//"for each remaining point:"
    },
    {id: "set-current", text: "current ← p[i]", //"current = next point",
        indent: 1
    },
    {id: "remove-inactive",
        text: "remove points left of the δ-wide activeWindow from activeSet", indent: 1
    },
    {id: "candidate-window",
        text: "C ← points in activeSet with |current.y − p.y| < δ", indent: 1 //select candidates with |current.y - p.y| < δ
    },
    {
        id: "check-distance",
        text: "compare current with each p ∈ C", indent: 1 //compare current with each candidate
    },
    {id: "update-best",
        text: "if a closer pair is found: update δ and closestPair", indent: 1
    },
    {id: "insert-current",
        text: "insert current into activeSet", indent: 1
    },
    {id: "return",
        text: "return closestPair and δ"
    }
];

export const isSamePair = (a: PointPair | null, b: PointPair | null): boolean => {
    // Wenn eines der paare null ist, sind sie nur gleich, wenn BEIDE null sind
    if (!a || !b) return a === b;
    const normalMatch = a.p0.id === b.p0.id && a.p1.id === b.p1.id;
    const flippedMatch = a.p0.id === b.p1.id && a.p1.id === b.p0.id;
    return normalMatch || flippedMatch;
};

export const PSEUDOCODE_MAX_DEGREE: PseudoCodeLine[] = [

    {
        id: "INIT_CE",
        text: "C = ∅",
        indent: 0
    },

    {
        id: "INIT_CE",
        text: "E' = G.E",
        indent: 0
    },

    {
        id: "INIT_N",
        text: "N = maps vertices to degrees",
        indent: 0
    },

    {
        id: "WHILE",
        text: "while E' ≠ ∅ do",
        indent: 0
    },

    {
        id: "CHOOSE",
        text: "u = vertex with the highest degree according to N",
        indent: 1
    },

    {
        id: "ADD",
        text: "C = C ∪ {u}",
        indent: 1
    },

    {
        id: "REMOVE",
        text: "remove all incident edges from E' and update N",
        indent: 1
    },

    {
        id: "RETURN",
        text: "return C",
        indent: 0
    }
];

export const PSEUDOCODE_RANDOM: PseudoCodeLine[] = [

    {
        id: "INIT_CE",
        text: "C = ∅",
        indent: 0
    },

    {
        id: "INIT_CE",
        text: "E' = G.E",
        indent: 0
    },

    {
        id: "WHILE",
        text: "while E' ≠ ∅ do",
        indent: 0
    },

    {
        id: "CHOOSE",
        text: "choose an arbitrary edge e = (u, v) ∈ E'",
        indent: 1
    },

    {
        id: "ADD",
        text: "C = C ∪ {u, v}",
        indent: 1
    },

    {
        id: "REMOVE",
        text: "remove all edges from E' that are incident to u or v",
        indent: 1
    },

    {
        id: "RETURN",
        text: "return C",
        indent: 0
    }
];

export const colors = {red: "#be3d2a", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0000CD"}
