import type {PseudoCodeLine} from "../../shared/Types.tsx";

export function getActiveLineIdsEhrlich(stepIndex: number, maxIndex: number) {
    console.log(stepIndex)
    if (stepIndex === 0) {
        return ["initB"];
    } else if (stepIndex === 1) {
        return ["initK"]
    } else if (stepIndex === maxIndex) {
        return ["return"];
    } else if (stepIndex % 3 === 2) {
        return ["swapA"]
    } else if (stepIndex % 3 === 0) {
        return ["flipB"];
    } else if (stepIndex % 3 === 1) {
        return ["getNextK"]
    } else {
        return [];
    }
}

export const PSEUDOCODE_EHRLICH_SWAPS: PseudoCodeLine[] = [

    {
        id: "initB",
        text: "initialize b[j] = j",
        indent: 0
    },

    {
        id: "initK",
        text: "k = 1",
        indent: 0
    },

    {
        id: "while",
        text: "while k < n do",
        indent: 0
    },

    {
        id: "swapA",
        text: "swap a[0] and a[b[k]]",
        indent: 1
    },

    {
        id: "flipB",
        text: "flip in b the subarray b[1...k-1]",
        indent: 1
    },

    {
        id: "getNextK",
        text: "compute next k",
        indent: 1
    },

    {
        id: "return",
        text: "return",
        indent: 0
    }
];