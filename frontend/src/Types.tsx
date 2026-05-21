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

/*
export type StaticNodesProps = {
    nodes: Node[];
};
*/

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

    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;

    //für scrubber:
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;

    //pendingImportProgress: number | null;
    //onImportProgressApplied: () => void;

    onExport: () => void;
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

export type ExportState = {
    nodes: Node[];
    progress: number;
    stepIndex: number;
};

//Überlegung für später
//Step + lokaler Step Fortschritt
//also stepIndex = aktueller Abschnitt / aktueller Step
// stepProgress = Fortschritt zwischen diesem Step und dem nächsten Step


/*
User klickt Export
→ App nimmt nodes + progress + currentStep
→ JSON.stringify
→ Base64URL
→ clipboard.writeText(...)

User fügt String ein
→ decode
→ nodes setzen
→ Backend mit nodes aufrufen
→ steps setzen
→ Output anzeigen
→ Timeline bauen
→ progress setzen
→ pause


if (typeof imported.progress === "number") {
    tl.progress(imported.progress).pause();
} else {
    tl.seek(imported.stepIndex.toString()).pause();
}
* */