import type {Edge, Graph, Node, VertexCoverRequest} from "./Types.tsx";
import {getAlphabetLabel, getRandomId} from "../../shared/Utils.tsx";


export function getRandomGraph(n: number, density: number): Graph {
    const nodes: Node[] = [];

    for (let i = 0; i < n; i++) {
        const xCoordinate = ((Math.cos((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        const yCoordinate = ((Math.sin((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        nodes.push({
            x: Math.floor(xCoordinate * 1123),
            y: Math.floor(yCoordinate * 500),
            id: getRandomId(),
            label: ""
        })
    }

    return getRandomEdges(nodes, density);
}

export function getRandomEdges(nodes: Node[], d: number): Graph {
    const graph: Graph = {nodes: nodes, edges: []};

    for (let i = 0; i < graph.nodes.length; i++) {
        for (let j = i + 1; j < graph.nodes.length; j++) {
            if (Math.random() < d) {
                graph.edges.push({fromId: graph.nodes[i].id, toId: graph.nodes[j].id, id: getRandomId()});
            }
        }
    }
    return graph;
}

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
export const COLORS = {black: "#000000", red: "#be3d2a", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0000CD"}