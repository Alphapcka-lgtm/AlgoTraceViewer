import type {Edge, Graph, Node, VertexCoverRequest} from "./Types.tsx";
import {getAlphabetLabel} from "../../shared/Utils.tsx";


export function getFormattedRequest(request: VertexCoverRequest): VertexCoverRequest {

    const graph = formatGraph(request);

    let nodeOrder: string[];
    let edgeOrder: string[];

    if (!request.nodeOrder || request.nodeOrder.length === 0) {
        nodeOrder = graph.nodes.map(node => node.id);
        shuffle(nodeOrder);
    } else {
        nodeOrder = [...request.nodeOrder];
    }

    if (!request.edgeOrder || request.edgeOrder.length === 0) {
        edgeOrder = graph.edges.map(edge => edge.id);
        shuffle(edgeOrder);
    } else {
        edgeOrder = [...request.edgeOrder];
    }

    return { nodeOrder, edgeOrder, graph, timestamp: Date.now() };
}

function formatGraph(input: VertexCoverRequest): Graph {

    const idMap = new Map<string, string>();

    input.graph.nodes.forEach((node, index) => {
        idMap.set(node.id, getAlphabetLabel(index));
    });

    const nodes: Node[] = input.graph.nodes.map(node => ({
        x: node.x,
        y: node.y,
        id: idMap.get(node.id)!,
        label: idMap.get(node.id)!,
    }));

    const edges: Edge[] = input.graph.edges.map(edge => {
        const newFromId = idMap.get(edge.fromId)!;
        const newToId = idMap.get(edge.toId)!;

        return {
            fromId: newFromId,
            toId: newToId,
            id: `${newFromId}-${newToId}`,
        };
    });

    return {nodes, edges};
}

function shuffle<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}