import type {PseudoCodeLine} from "../../shared/Types.tsx";

export function getActiveLineIdsMaxDegree(stepIndex: number, maxIndex: number) {
    if (stepIndex === 0) {
        return ["initC", "initE"];
    } else if (stepIndex === 1) {
        return ["initN"]
    } else if (stepIndex === maxIndex) {
        return ["return"];
    } else if (stepIndex % 3 === 2) {
        return ["choose"]
    } else if (stepIndex % 3 === 0) {
        return ["add"];
    } else if (stepIndex % 3 === 1) {
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
    if (stepIndex === 0) {
        return ["initC", "initE"];
    } else if (stepIndex === maxIndex) {
        return ["return"];
    } else if (stepIndex % 3 === 1) {
        return ["choose"]
    } else if (stepIndex % 3 === 2) {
        return ["add"]
    } else if (stepIndex % 3 === 0) {
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

export const colors = {red: "#be3d2a", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0000CD"}

export function NodeIcon() {
    return (
        <>
            <circle cx={9} cy={9} r={9} fill="black"/>
            <circle cx={9} cy={9} r={8} fill={colors.orange}/>
            <circle cx={9} cy={9} r={7} fill="black"/>
            <circle cx={9} cy={9} r={6} fill={colors.orange}/>
        </>
    );
}

export function RemainingEdgeIcon() {
    return (
        <>
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={colors.blue}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke="black"
                strokeWidth={2}
            />
        </>
    );
}

export function ArbitraryEdgeIcon() {
    return (
        <>
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={colors.red}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke="black"
                strokeWidth={2}
            />
        </>
    );
}

export function NodeDegreeMapIcon() {
    return (
        <>
            <rect
                x={0}
                y={0}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={10}
                y={0}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={0}
                y={10}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={10}
                y={10}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
        </>
    );
}