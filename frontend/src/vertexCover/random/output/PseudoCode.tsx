import type {PseudoCodeLine} from "../../../sweepLine/shared/Types.tsx";

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

export const PSEUDOCODE: PseudoCodeLine[] = [

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