import type { Node } from "./Types.tsx"

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
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

export function getRandomId(): string{
    const chars = "abcdefghijklmnopqrstuvwxyz";
    return encodeUsingChars(Math.floor(Date.now() * Math.random()), chars + chars.toUpperCase());
}