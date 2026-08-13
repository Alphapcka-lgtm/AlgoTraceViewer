import type {PseudoCodeLine} from "../../shared/Types.tsx";

export const PSEUDOCODE_MAX_DEGREE: PseudoCodeLine[] = [

    {
        id: "INIT_C",
        text: "C = ∅",
        indent: 0
    },

    {
        id: "INIT_E",
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
        id: "INIT_C",
        text: "C = ∅",
        indent: 0
    },

    {
        id: "INIT_E",
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
