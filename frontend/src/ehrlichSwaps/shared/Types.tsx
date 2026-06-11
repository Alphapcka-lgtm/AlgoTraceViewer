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

export type AnimationResponse = {
    ids: string[],
    timestamp: number,
};

export type AnimationRequest = {
    graph: Graph,
    densityFactor: number,
    randomSeed: number,
    timestamp: number,
};