import React from "react";

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

//was Input alles von App bekommt
export type InputProps = {
    height: number;
    width: number;
    mode: string;
    nodes: Node[];
    onAddNode: (node: Node) => void;
    onMoveNode: (id: string, x: number, y: number) => void;
    onDeleteNode: (id: string) => void;
    onReset: () => void;
    onSubmit: () => void;
    onChangeInput: () => void;
    onImport: (encoded: string) => void;
    onSetNodeCount: (count: number) => void;
    selectedPreset: string;
    onPresetChange: (selected: string) => void;
    createExportString: () => string;
};

export interface Result {
    p0: Node;
    p1: Node;
    distance: number;
}

export interface AlgorithmStepDTO {
    description: string;
    currentPoint: Node | null; //null weil wenn Algorithmus fertig ist gibt es keinen current point mehr (es wird ja keiner mehr verarbeitet)
    sweepLineX: number;
    deltaAfterCandidateCheck: number; //neues bestes δ nach Kandidatensuche
    deltaBeforeCandidateCheck:number; //altes delta vor Kandidatensuche
    activePoints: Node[];
    allPoints: Node[];
    bestPair: Result | null;
    candidatePairs: Result[];
    processedPoints: Node[];
    futurePoints: Node[];
    pseudoCodeLineIds: string[];
}

//was Output von App bekommt
export type OutputProps = {
    height: number;
    width: number;
    steps: AlgorithmStepDTO[];
    loading: boolean;
    error: string | null;
    onChangeInput: () => void;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type SweepLineInputState = {
    nodes: Node[];
    timestamp: number;
};

export type SweepLineOutputState = {
    steps: AlgorithmStepDTO[];
    timestamp: number;
};

export type RingStyle = "none" | "active" | "candidate";

export type XNodeProps = {
    node: Node;
    fill: string;
    scale?: number;
    ringStyle?: RingStyle;
};
