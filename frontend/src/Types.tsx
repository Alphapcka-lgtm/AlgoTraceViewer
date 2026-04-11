export type Node = {
    x: number;
    y: number;
    id: string;
};

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string };

export type DynamicNodesProps = {
    nodes: Node[];
    onMouseDown: (id: string) => void;
    onMouseUp: () => void;
    onDoubleClick: (id: string) => void;
};

export type SVGInputProps = {
    height: number;
    width: number;
};