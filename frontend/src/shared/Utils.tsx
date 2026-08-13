import LZString from "lz-string";
import type {ExportState} from "./Types.tsx";

export const SVG_WIDTH = 1123;
export const SVG_HEIGHT = 500;

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

export function getCurrentTimelineStepIndex(tl: gsap.core.Timeline, labels: string[]): number {
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