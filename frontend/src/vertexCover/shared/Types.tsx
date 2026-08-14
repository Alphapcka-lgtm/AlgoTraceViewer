import type {Dispatch, SetStateAction} from "react";
import type {Point} from "../../closestPair/shared/Types.tsx";
import type {CommonOutputProps} from "../../shared/Types.tsx";

export type Edge = {
    fromId: string,
    toId: string,
    id: string,
};

export type Node = Point;

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
    timestamp: number,
};

export type AnimationState = {
    chosenEdge: Edge,
    chosenNodes: Node[],
    incidentEdges: Edge[],
    degreeMap: NodeDegreePair[]
};

export type NodeDegreePair = {
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
    variant: VertexCoverVariant,
    cProps: CommonOutputProps
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
    densityFactor: number,
    setDensityFactor: Dispatch<SetStateAction<number>>,
    onSubmit: (input: VertexCoverRequest) => void;
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type InputControlProps = {
    input: VertexCoverRequest,
    setInput: Dispatch<SetStateAction<VertexCoverRequest>>,
    densityFactor: number,
    setDensityFactor: Dispatch<SetStateAction<number>>,
    setInteraction: Dispatch<SetStateAction<Interaction>>,
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type PreviewEdgeProps = {
    interaction: Interaction,
    nodes: Node[],
};

export type TimelineStep = {
    label: string;
    backendStepIndex: number,
    stepType: StepType
}

export type StepType =
    | "INIT"
    | "INIT_N"
    | "WHILE"
    | "CHOOSE"
    | "ADD"
    | "REMOVE"
    | "RETURN";

export type LegendProps = {
    initialDegreeMap?: NodeDegreePair[];
    variant: VertexCoverVariant;
    currentStepIndex: number,
    maxStepIndex: number,
}

export type VariantNavigationProps = {
    variant: VertexCoverVariant,
    disabled: boolean,
    onTabChange: (variant: VertexCoverVariant) => void,

}