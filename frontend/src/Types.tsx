
export type Node = { x: number; y: number; id: number };

export type Edge = { fromId: number; toId: number; id: number };

export type Graph = {nodes: Node[], edges: Edge[]};

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: number }
    | { type: "drawing-edge"; fromId: number; to?: { x: number; y: number } };

export type NodesProps = {
    nodes: Node[],
    onMouseDown: (i: number) => void,
    onMouseUp: () => void,
    onClick: (node: Node) => void,
    onDoubleClick: (i: number) => void
} | {nodes: Node[]};

export type SVGInputProps = {
    onSubmit: (graph: Graph) => void,
    mode: string
};

export type State = {chosenEdge: Edge, chosenNodes: Node[], incidentEdges: Edge[]}
export type Animation = {initialState: Graph, intermediateStates: State[]}
export type SVGOutputProps = {onChangeInput: () => void, mode: string, output: Animation};