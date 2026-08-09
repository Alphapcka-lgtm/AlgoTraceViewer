import React from "react";
import LZString from "lz-string";
import type {ExportState, PseudoCodeLine} from "./Types.tsx";
import type {Node, PointPair, SweepLineStepType} from "../sweepLine/shared/Types.tsx"

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

export const btnStyle: React.CSSProperties = {
    flex: 1,
    border: "2px solid black",
    borderRadius: "10px",
    fontFamily: "monospace",
    padding: "4px 10px",
    cursor: "pointer",
    backgroundColor: "rgba(240, 240, 240, 0.8)",
    fontSize: 18
};


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
export function assignLabels(nodes: Node[]): Node[] {
    return nodes.map((node, index) => ({...node, label: getAlphabetLabel(index)}));
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

const createRandomNode = (padding: number, svgWidth:number, svgHeight:number): Node => {
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
export const createRandomNodes = (count: number, padding: number, svgWidth:number, svgHeight:number): Node[] => {
    const nodes: Node[] = [];
    for (let i = 0; i < count; i++) {
        nodes.push(createRandomNode(padding, svgWidth, svgHeight));
    }
    return nodes;
};

export function getActivePseudoCodeLineIds(stepType: SweepLineStepType): string[] {
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
    {id: "init", text: "initialize closestPair and δ using p[0] and p[1]"
    },
    {id: "for-loop", text: "for i ← 2 to |p| − 1 do"//"for each remaining point:"
    },
    {id: "set-current", text: "current ← p[i]", //"current = next point",
        indent: 1
    },
    {id: "remove-inactive",
        text: "remove points outside the active window", indent: 1
    },
    {id: "candidate-window",
        text: "C ← active points with |current.y − p.y| < δ", indent: 1 //select candidates with |current.y - p.y| < δ
    },
    {
        id: "check-distance",
        text: "compare current with each p ∈ C", indent: 1 //compare current with each candidate
    },
    {id: "update-best",
        text: "if a closer pair is found: update δ and closestPair", indent: 1
    },
    {id: "insert-current",
        text: "insert current into the active set", indent: 1
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