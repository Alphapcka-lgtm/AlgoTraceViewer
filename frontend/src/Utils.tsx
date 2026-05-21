import React from "react";
import type {ExportState} from "./Types.tsx";

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
    backgroundColor:"rgba(240, 240, 240, 0.8)",
    fontSize:18
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
    let result:string = "";
    let current:number = i;
    while (current >= 0) {
        const rest = current % 26;
        const char = String.fromCharCode(65 + rest);
        result = char + result;
        current = Math.floor(current / 26) - 1;
    }
    return result;
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
    const json = JSON.stringify(state);
    return btoa(encodeURIComponent(json));
}

export function decodeExportState(encoded: string): ExportState {
    const json = decodeURIComponent(atob(encoded));
    return JSON.parse(json) as ExportState;
}

export function createStepLabels(stepCount: number): string[] {
    return Array.from({ length: stepCount }, (_, i) => String(i));
}

/*
Vllt baue ich das später noch bei initialProgress in svgOutput ein ...
export function checkProgress(progress: number): number {
    if (progress < 0) return 0;
    if (progress > 1) return 1;
    return progress;
}
 */