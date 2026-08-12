import type {Node} from "../../closestPair/shared/Types.tsx"
import type {Dispatch, SetStateAction} from "react";

export type Edge = {
    fromId: string,
    toId: string,
    id: string,
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
    nodeOrder: string[],
    edgeOrder: string[],
    initialDegreeMap: NodeDegreePair[]
    intermediateStates: AnimationState[],
    timestamp: number,
};

export type AnimationState = {
    chosenEdge: Edge,
    chosenNodes: Node[],
    incidentEdges: Edge[],
    degreeMap: NodeDegreePair[]
};

type NodeDegreePair = {
    node: Node,
    degree: number,
}

export type VertexCoverRequest = {
    graph: Graph,
    nodeOrder: string[],
    edgeOrder: string[],
    timestamp: number,
};

export type SVGOutputProps = {
    output: AnimationResponse,
    progress: number,
    setProgress: Dispatch<SetStateAction<number>>,
    currentStepIndex: number,
    setCurrentStepIndex: Dispatch<SetStateAction<number>>,
    onChangeInput: () => void;
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type VertexCoverVariant = "random" | "maxDegree" | "staticList";

export type NavButtonProps = {
    variant: VertexCoverVariant;
    label: string;
    activeVariant: VertexCoverVariant;
    onTabChange: (variant: VertexCoverVariant) => void;
};
export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string }
    | { type: "drawing-edge"; fromId: string; to: { x: number; y: number }
};

export type SVGInputProps = {
    input: VertexCoverRequest,
    setInput: Dispatch<SetStateAction<VertexCoverRequest>>,
    onSubmit: (input: VertexCoverRequest) => void;
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type InputControlProps = {
    input: VertexCoverRequest,
    setInput: Dispatch<SetStateAction<VertexCoverRequest>>,
    setInteraction: Dispatch<SetStateAction<Interaction>>,
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type PreviewEdgeProps = {
    interaction: Interaction,
    nodes: Node[],
};