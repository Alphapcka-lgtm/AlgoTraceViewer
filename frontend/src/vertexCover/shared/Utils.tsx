import type { Node } from "./Types.tsx"

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}

export function getRandomId(): string{
    return "i" + Math.floor(Date.now() * Math.random()).toString()
}

export async function compressAndEncode(str: string) {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    writer.write(new TextEncoder().encode(str));
    writer.close();

    const compressed = await new Response(cs.readable).arrayBuffer();
    return byteArrayToBase64(compressed);
}

function byteArrayToBase64(data: ArrayBuffer){
    const bytes = new Uint8Array(data);
    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary)
}

export async function decodeAndDecompress(str: string) {
    const dcs = new DecompressionStream("gzip");
    const writer = dcs.writable.getWriter();
    writer.write(base64ToByteArray(str));
    writer.close();

    return await new Response(dcs.readable).text();
}

function base64ToByteArray(str: string){
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}