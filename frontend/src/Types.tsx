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

export type StaticNodesProps = {
    nodes: Node[];
};

//was SVGInput alles von App bekommt
export type SVGInputProps = {
    height: number;
    width: number;
    mode: string;

    nodes: Node[];

    onAddNode: (node: Node) => void;
    onMoveNode: (id: string, x: number, y: number) => void;
    onDeleteNode: (id: string) => void;
    onReset: () => void;

    onSubmit: (nodes: Node[]) => void;
    onChangeInput: () => void;
};