import React from "react";
import type {AnimationRequest} from "../../vertexCover/shared/Types.tsx";

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

    onSubmit: () => void;
    onChangeInput: () => void;

    onImport: (encoded: string) => void;
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
    delta: number; //neues bestes δ nach Kandidatensuche
    searchDelta:number; //altes delta vor Kandidatensuche
    activePoints: Node[];
    allPoints: Node[];
    bestPair: Result | null;
    candidatePairs: Result[];
    processedPoints: Node[];
    futurePoints: Node[];
    pseudoCodeLineIds: string[];
}

//was SVGOutput von App bekommt
export type SVGOutputProps = {
    height: number;
    width: number;
    steps: AlgorithmStepDTO[];
    loading: boolean;
    error: string | null;
    onChangeInput: () => void;

    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;

    //für scrubber:
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;

    createExportString: () => string;
};

export type OutputControlProps4 = {
    timelineRef: React.RefObject<gsap.core.Timeline>
    labels: string[];

    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    stepCount: number;

    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;

    //Für scrubber
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;


    playbackSpeed: number;
    onPlaybackSpeedChange: (speed: number) => void;
};

export type SweepLineInputState = {
    nodes: Node[];
    timestamp: number;
};

export type SweepLineOutputState = {
    steps: AlgorithmStepDTO[];
    timestamp: number;
};


export type XNodeProps = {
    node: Node;
    fill: string;
};

export type ModeTabsProps = {
    mode: "input" | "output";
    onChangeInput: () => void;
    onSubmit: () => void;
    canSubmit: boolean;
};

export type ExportState =
    | { algorithm: "sweepLine", progress: number, input: Node[] }
    | { algorithm: "randomvertexcover", progress: number, input: AnimationRequest }
    | { algorithm: "maxdegreevertexcover", progress: number, input: AnimationRequest };

export type PseudoCodeLine = {
    id: string;
    text: string;
    indent?: number;
};
