import type { Node } from "./Types.tsx"
import type {PseudoCodeLine} from "../../../sweepLine/shared/Types.tsx";

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}

export function getRandomId(): string{
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return encodeUsingChars(Math.floor(Date.now() * Math.random()), chars + chars.toUpperCase());
}

export function getStepIndexFromTimeline(tl: gsap.core.Timeline, labels: string[]): number {
    const currTime = tl.time();
    let stepIndex = 0;

    for (let i = 0; i < labels.length; i++) {
        const labelTime = tl.labels[labels[i]];
        if (labelTime <= currTime + 0.0001) {
            stepIndex = i;
        } else {
            break;
        }
    }

    return stepIndex;
}

export function createStepLabels(stepCount: number): string[] {
    return Array.from({ length: stepCount }, (_, i) => String(i));
}

function encodeUsingChars(i: number, chars: string): string {
    const base = chars.length;

    let label = "";

    do {
        label = chars.charAt(i % base) + label;
        i = Math.floor(i / base);
    } while (i > 0);

    return label;
}

export function getNodeLabel(i: number) : string {
    return encodeUsingChars(i, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

export function getActiveLineIds(stepIndex: number, maxIndex: number) {
    if(stepIndex === 0) {
        return ["initC", "initE"];
    } else if (stepIndex === 1) {
        return ["initN"]
    } else if(stepIndex === maxIndex){
        return ["return"];
    } else if(stepIndex % 3 === 2) {
        return ["choose"]
    } else if(stepIndex % 3 === 0) {
        return ["add"];
    } else if(stepIndex % 3 === 1) {
        return ["remove"]
    } else {
        return [];
    }
}

export const MAX_DEGREE_VERTEX_COVER_PSEUDOCODE: PseudoCodeLine[] = [

    {
        id: "initC",
        text: "C = ∅",
        indent: 0
    },

    {
        id: "initE",
        text: "E' = G.E",
        indent: 0
    },

    {
        id: "initN",
        text: "N = maps vertices to degrees",
        indent: 0
    },

    {
        id: "while",
        text: "while E' ≠ ∅ do",
        indent: 0
    },

    {
        id: "choose",
        text: "u = vertex with the highest degree according to N",
        indent: 1
    },

    {
        id: "add",
        text: "C = C ∪ {u}",
        indent: 1
    },

    {
        id: "remove",
        text: "remove all edges from E' that are incident to u and update N",
        indent: 1
    },

    {
        id: "return",
        text: "return C",
        indent: 0
    }
];