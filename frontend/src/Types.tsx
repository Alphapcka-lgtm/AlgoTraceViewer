
export type Node = { x: number; y: number; id: string };

export type Edge = { fromId: string; toId: string; id: string };

export type Graph = {nodes: Node[], edges: Edge[]};

export type EdgesProps = {nodes: Node[], edges: Edge[], idPrefix: string};

export type NormalizedEdgesProps = {nodes: Node[], edges: Edge[], idPrefix: string, x: number, y: number, width: number, itemSize: number};

export type PreviewEdgeProps = {interaction: Interaction, nodes: Node[]};

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string }
    | { type: "drawing-edge"; fromId: string; to?: { x: number; y: number } };

export type DynamicNodesProps = {
    nodes: Node[],
    onMouseDown: (i: string) => void,
    onMouseUp: () => void,
    onClick: (node: Node) => void,
    onDoubleClick: (i: string) => void
};

export type StaticNodesProps = {
    nodes: Node[]
};

export type SVGInputProps = {
    onSubmit: (graph: Graph) => void,
    mode: string,
    height: number
};

export type SVGOutputProps = {
    onChangeInput: () => void,
    mode: string,
    output: Animation,
    height: number
};

export type State = {chosenEdge: Edge, chosenNodes: Node[], incidentEdges: Edge[]}
export type Animation = {initialState: Graph, intermediateStates: State[]}