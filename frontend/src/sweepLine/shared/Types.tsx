export type Node = {
    x: number,
    y: number,
    id: string,
};

export type Graph = {
    nodes: Node[],
};

export type NodesProps = {
    nodes: Node[],
    onMouseDown: (i: string) => void,
    onMouseUp: () => void,
    onDoubleClick: (i: string) => void,
};

export type AnimationResponse = {
    initialState: Graph,
    intermediateStates: AnimationState[],
    timestamp: number,
};

export type AnimationState = {
    currentNode: Node,
    nodesToCompare: Node[],
    closestNode: Node,
    d: number,
};

export type AnimationRequest = {
    graph: Graph,
    timestamp: number,
};

export type ExportImport = {
    input: AnimationRequest,
    initialProgress: number,
};