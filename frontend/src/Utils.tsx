import type {Graph, Node} from "./Types.tsx"

export function getNodeById(nodes: Node[], id: string): Node{
    return nodes.find((n) => n.id === id)!;
}

export function getRandomId(): string{
    return "i" + Math.floor(Date.now() * Math.random()).toString()
}

export function getRandomGraph(n: number, d: number, w: number, h: number) : Graph {

    const graph: Graph = {nodes: [], edges: []};

    for (let i = 0; i < n; i++) {
        const xCoordinate = ((Math.cos((i * 2 * Math.PI) / n) + 1.1) * w * 0.45);
        const yCoordinate = ((Math.sin((i * 2 * Math.PI) / n) + 1.1) * h * 0.45);
        graph.nodes.push({ x: xCoordinate, y: yCoordinate, id: getRandomId() })
    }

    for (let i = 0; i < graph.nodes.length; i++) {
        for (let j = i+1; j < graph.nodes.length; j++) {
            if(Math.random() < d) {
                graph.edges.push({fromId: graph.nodes[i].id, toId: graph.nodes[j].id, id: getRandomId() });
            }
        }
    }
    return graph;
}

export async function compressString(str: string) {
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

export async function decompressString(str: string) {
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