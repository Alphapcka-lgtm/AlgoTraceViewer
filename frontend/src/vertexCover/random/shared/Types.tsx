export type Node = {
    x: number,
    y: number,
    id: string,
    label?: string,
};

export type Edge = {
    fromId: string,
    toId: string,
    id: string,
    label?: string,
};

export type Graph = {
    nodes: Node[],
    edges: Edge[],
};

export type NodesProps = {
    nodes: Node[],
    onMouseDown?: (i: string) => void,
    onMouseUp?: () => void,
    onClick?: (node: Node) => void,
    onDoubleClick?: (i: string) => void,
};

export type EdgesProps = {
    nodes: Node[],
    edges: Edge[],
};

export type AnimationResponse = {
    initialState: Graph,
    intermediateStates: AnimationState[],
    randomSeed: number,
    timestamp: number,
};

export type AnimationState = {
    chosenEdge: Edge,
    chosenNodes: Node[],
    incidentEdges: Edge[],
};

export type AnimationRequest = {
    graph: Graph,
    densityFactor: number,
    randomSeed: number,
    timestamp: number,
};