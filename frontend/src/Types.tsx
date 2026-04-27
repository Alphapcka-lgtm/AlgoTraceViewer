import type {Dispatch, SetStateAction} from "react";

export type Node = {
    x: number,
    y: number,
    id: string,
};

export type Edge = {
    fromId: string,
    toId: string,
    id: string,
};

export type Graph = {
    nodes: Node[],
    edges: Edge[],
};

export type EdgesProps = {
    nodes: Node[],
    edges: Edge[],
    idPrefix: string,
};

export type NormalizedEdgesProps = {
    nodes: Node[],
    edges: Edge[],
    idPrefix: string,
    x: number,
    y: number,
    width: number,
    height: number,
    itemSize: number,
};

export type PreviewEdgeProps = {
    interaction: Interaction,
    nodes: Node[],
};

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string }
    | { type: "drawing-edge"; fromId: string; to?: { x: number; y: number } };

export type DynamicNodesProps = {
    nodes: Node[],
    onMouseDown: (i: string) => void,
    onMouseUp: () => void,
    onClick: (node: Node) => void,
    onDoubleClick: (i: string) => void,
};

export type StaticNodesProps = {
    nodes: Node[]
};

export type SVGInputProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    height: number,
};

export type SVGOutputProps = {
    output: AnimationResponse,
    height: number,
    currentProgress: number,
    setCurrentProgress:  Dispatch<SetStateAction<number>>,
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

export type ExportImport = {
    input: AnimationRequest,
    initialProgress: number,
}