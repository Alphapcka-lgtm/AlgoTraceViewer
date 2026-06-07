import type { Node } from "./Types.tsx"
import type {PseudoCodeLine} from "../../../sweepLine/shared/Types.tsx";

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}

export function getRandomId(): string{
    return "i" + Math.floor(Date.now() * Math.random()).toString()
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

export function getNodeLabel(i: number): string {
    if(i < 26){
        return String.fromCharCode(65 + i);
    } else {
        return getNodeLabel((i / 26) - 1) + String.fromCharCode(65 + (i % 26) );
    }
}

export function getActiveLineIds(stepIndex: number, maxIndex: number) {
    if(stepIndex === 0){
        return ["initC", "initE"];
    } else if(stepIndex === maxIndex){
        return ["return"];
    } else if(stepIndex % 3 === 1) {
        return ["choose"]
    } else if(stepIndex % 3 === 2) {
        return ["add"]
    } else if(stepIndex % 3 === 0) {
        return ["remove"]
    } else {
        return [];
    }
}

export const RANDOM_VERTEX_COVER_PSEUDOCODE: PseudoCodeLine[] = [

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
        id: "while",
        text: "while E' ≠ ∅ do",
        indent: 0
    },

    {
        id: "choose",
        text: "choose an arbitrary edge e = (u, v) ∈ E'",
        indent: 1
    },

    {
        id: "add",
        text: "C = C ∪ {u, v}",
        indent: 1
    },

    {
        id: "remove",
        text: "remove all edges from E' that are incident to u or v",
        indent: 1
    },

    {
        id: "return",
        text: "return C",
        indent: 0
    }
];