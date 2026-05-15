import type {Dispatch, RefObject, SetStateAction} from "react";

/*
export type Node = {
    x: number;
    y: number;
    id: string;
};
*/

export type Node = {
    x: number;
    y: number;
    id: string;
    label: string;
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

    //onAddNode: (node: Node) => void;
    onAddNode: (node: Omit<Node, "label">) => void;
    onMoveNode: (id: string, x: number, y: number) => void;
    onDeleteNode: (id: string) => void;
    onReset: () => void;

    onSubmit: (nodes: Node[]) => void;
    onChangeInput: () => void;
};


export interface Result {
    p0: Node;
    p1: Node;
    distance: number;
}

export interface AlgorithmStepDTO {
    stepIndex: number;
    description: string;
    currentPoint: Node;
    sweepLineX: number;
    delta: number;
    activePoints: Node[];
    allPoints: Node[];
    bestPair: Result | null;
    candidatePairs: Result[];
    processedPoints: Node[];
}

//was SVGOutput von App bekommt
export type SVGOutputProps = {
    height: number;
    width: number;
    steps: AlgorithmStepDTO[];
    loading: boolean;
    error: string | null;
    onChangeInput: () => void;
};

export type OutputControlProps = {
    isPlaying: boolean;
    setIsPlaying: Dispatch<SetStateAction<boolean>>;
    progress: number;
    setProgress: Dispatch<SetStateAction<number>>;
    tlRef: RefObject<gsap.core.Timeline>; //tlRef wird von SVGOutput übergeben
};

export type XNodeProps = {
    node: Node;
    fill: string;
};