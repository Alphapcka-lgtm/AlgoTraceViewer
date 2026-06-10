import type {Node} from "../../sweepLine/shared/Types.tsx"
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
    initialDegreeMap: NodeDegreePair[]
    intermediateStates: AnimationState[],
    randomSeed: number,
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

export type AnimationRequest = {
    graph: Graph,
    densityFactor: number,
    preset: string,
    randomSeed: number,
    timestamp: number,
};

export type SVGOutputProps = {
    output: AnimationResponse,
    progress: number,
    setProgress: Dispatch<SetStateAction<number>>,
    stepIndex: number,
    setStepIndex: Dispatch<SetStateAction<number>>,
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