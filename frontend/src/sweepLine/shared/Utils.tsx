import React from "react";
import type {ExportState, PseudoCodeLine, Node} from "./Types.tsx";


export function getRandomId(): string {
    return "i" + Math.floor(Date.now() * Math.random()).toString();
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

export const tabStyle = (active: boolean, disabled: boolean): React.CSSProperties => ({
    ...btnStyle,
    width: "50%",
    opacity: disabled ? 0.45 : 1,
    border: "2px solid black",
    //borderBottom: active ? "3px solid black" : "1px solid #aaa",
    fontWeight: active ? "bold" : "normal",
    cursor: disabled ? "default" : "pointer",
});


/*
0  -> A
1  -> B
...
25 -> Z
26 -> AA
27 -> AB
*/
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
label werden nur für anzeige und explanations benuzt... deshalb gibt es noch node id
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


function roundNumber(num:number, decimals:number):number {
    const factor:number = 10 ** decimals;
    return Math.round((num+Number.EPSILON) * factor) / factor;
}

function roundNodeCoordinates(nodes: Node[], decimals: number): Node[] {
    return nodes.map((node) => ({...node, x: roundNumber(node.x, decimals), y: roundNumber(node.y, decimals)}));
}

export function encodeExportState(state: ExportState): string {
    let exportState = state;

    if (state.algorithm === "sweepLine") {
        exportState = {...state,
            input: roundNodeCoordinates(state.input, 4),
           // progress: roundNumber(state.progress, 5),

        };
    }
    /*
    else if (state.algorithm === "vertexCover") {
        exportState = {...state,
            input: {...state.input,
                graph: {
                    ...state.input.graph,
                    nodes: roundNodeCoordinates(state.input.graph.nodes, 4),
                },
            },
        };
    }
    */

    const json = JSON.stringify(exportState);
    return btoa(encodeURIComponent(json));
}

export function decodeExportState(encoded: string): ExportState {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as ExportState;
}

export function createStepLabels(stepCount: number): string[] {
    return Array.from({length: stepCount}, (_, i) => String(i));
}

/*
Vllt baue ich das später noch bei initialProgress in svgOutput ein ...
export function checkProgress(progress: number): number {
    if (progress < 0) return 0;
    if (progress > 1) return 1;
    return progress;
}
 */


export const SWEEP_LINE_PSEUDOCODE: PseudoCodeLine[] = [
    { id: "init", text: "initialize xQueue, yTable, bestPair and δ" },

    { id: "for-loop", text: "for each point current from left to right:" },

    {
        id: "update-active-window",
        text: "remove points outside the active sweep window",
        indent: 1
    },

    {
        id: "check-candidate-window",
        text: "compare current with points inside the candidate sweep window",
        indent: 1
    },

    {
        id: "update-bestpair",
        text: "if a closer pair was found: update bestPair and δ",
        indent: 1
    },

    {
        id: "shrink-windows",
        text: "shrink sweep windows to the new δ",
        indent: 1
    },

    {
        id: "insert-current",
        text: "insert current into yTable",
        indent: 1
    },

    { id: "return", text: "return bestPair and δ" }
];


/*
export const SWEEP_LINE_PSEUDOCODE: PseudoCodeLine[] = [
    {id: "sort", text: "xQueue = sortx(P)"},
    {id: "init-ytable", text: "yTable = [ ]"},
    {id: "init-bestpair", text: "bestPair = (p0, p1)"},
    {id: "init-delta", text: "δ = dist(p0, p1)"},
    {id: "insert-initial", text: "yTable.insert(p0), yTable.insert(p1)"},
    {id: "init-tail", text: "tail = 0"},



    {id: "for-loop", text: "for i = 2 to xQueue.size - 1:"},
    {id: "set-current", text: "current = xQueue.get(i)", indent: 1},
    {id: "while-loop", text: "while xQueue.get(tail).x ≤ current.x - δ:", indent: 1},
    {id: "remove-point", text: "yTable.delete(xQueue.get(tail))", indent: 2},
    {id: "increment-tail", text: "tail += 1", indent: 2},
    {id: "candidate-range", text: "for all points p in yTable where |p.y - current.y| < δ:", indent: 1},
    {id: "check-distance", text: "if p != current && dist(current, p) < δ:", indent: 2},
    {id: "update-delta", text: "δ = dist(current, p)", indent: 3},
    {id: "update-bestpair", text: "bestPair = (current, p)", indent: 3},
    {id: "insert-current", text: "yTable.insert(current)", indent: 1},

    {id: "return", text: "return (bestPair, δ)"}
];

 */