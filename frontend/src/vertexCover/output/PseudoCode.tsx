import type {PseudoCodeLine} from "../../sweepLine/shared/Types.tsx";

export function getActiveLineIdsMaxDegree(stepIndex: number, maxIndex: number) {
    if(stepIndex === 0){
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

export const PSEUDOCODE_MAX_DEGREE: PseudoCodeLine[] = [

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

export function getActiveLineIdsRandom(stepIndex: number, maxIndex: number) {
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

export const PSEUDOCODE_RANDOM: PseudoCodeLine[] = [

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