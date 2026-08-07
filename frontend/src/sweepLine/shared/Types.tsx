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

export interface PointPair {
    p0: Node;
    p1: Node;
    distance: number;
}

//Benötigt current Point nicht, da im DTO schon extra enthalten ist.
export interface CandidateComparison {
    candidate: Node;
    distance: number;
}

export type SweepLineStepType =
    | "INITIALIZATION"
    | "ADVANCE_AND_PRUNE"
    | "CHECK_CANDIDATES"
    | "COMMIT_ITERATION"
    | "FINISHED";

export interface AlgorithmStepDTO {
    stepType: SweepLineStepType;
    description: string;
    currentPoint: Node | null; //null weil wenn Algorithmus fertig ist gibt es keinen current point mehr (es wird ja keiner mehr verarbeitet)
    windowDelta: number; //Delta used to draw the sweep windows in this snapshot.
    activePoints: Node[];
    allPoints: Node[];
    bestPair: PointPair | null;
    candidateComparisons: CandidateComparison[];
    removedPoints: Node[];
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

export type PointDisplayState = {
    isCurrent: boolean;
    isBest: boolean;
    isProcessed: boolean;
    isFuture: boolean;
    isActive: boolean;
    isCandidate: boolean;
};


export type RectAttrs = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type LineAttrs = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};