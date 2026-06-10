import type { Node } from "../../sweepLine/shared/Types.tsx"

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}

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