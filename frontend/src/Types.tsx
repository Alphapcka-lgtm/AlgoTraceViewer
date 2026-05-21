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

    onImport: (encoded: string) => void;
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

Input:
    Import möglich
    Export nicht nötig

Output:
    Export möglich
    Import nicht nötig


User klickt Export
1. App nimmt nodes + progress + currentStep
2 JSON.stringify
3 Base64URL
4. clipboard.writeText(...)

Import:
1. String decodieren
2 nodes setzen
3. progress setzen
4. currentStep explizit setzen
5 Backend mit nodes aufrufen
6. Output rendern
7. Timeline bauen
8. Timeline explizit auf progress setzen

* */