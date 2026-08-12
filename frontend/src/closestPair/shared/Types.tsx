import type {AnimationRequest} from "../../shared/Types.tsx";

export type Point = {
    x: number;
    y: number;
    id: string;
    label: string;
};

export type Node = Point;

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; pointId: string };

export type DynamicPointsProps = {
    points: Point[];
    onMouseDown: (id: string) => void;
    onMouseUp: () => void;
    onDoubleClick: (id: string) => void;
};

//was Input alles von ClosestPair bekommt
export type InputProps = {
    mode: string;
    inputState: ClosestPairInputState;
    onAddPoint: (point: Point) => void;
    onMovePoint: (id: string, x: number, y: number) => void;
    onDeletePoint: (id: string) => void;
    onReset: () => void;
    onSubmit: () => void;
    onChangeInput: () => void;
    onImport: (encoded: string) => void;
    onSetPointCount: (count: number) => void;
    onPresetChange: (request: AnimationRequest) => void;
    createExportString: () => string;
};

export interface PointPair {
    p0: Point;
    p1: Point;
    distance: number;
}

//Benötigt current Point nicht, da im DTO schon extra enthalten ist.
export interface CandidateComparison {
    candidate: Point;
    distance: number;
}

export type ClosestPairStepType =
    | "START" //zustand vor dem alg = step 0
    | "INITIALIZATION"
    | "ADVANCE_AND_PRUNE"
    | "CHECK_CANDIDATES"
    | "COMMIT_ITERATION"
    | "FINISHED";

export interface AlgorithmStepDTO {
    stepType: ClosestPairStepType;
    description: string;
    currentPoint: Point | null; //null weil wenn Algorithmus fertig ist gibt es keinen current point mehr (es wird ja keiner mehr verarbeitet)
    windowDelta: number; //Delta used to draw the sweep windows in this snapshot.
    activePoints: Point[];
    allPoints: Point[];
    bestPair: PointPair | null;
    candidateComparisons: CandidateComparison[];
    removedPoints: Point[];
    processedPoints: Point[];
    futurePoints: Point[];
}

//was Output von ClosestPair bekommt
export type OutputProps = {
    steps: AlgorithmStepDTO[];
    loading: boolean;
    error: string | null;
    onChangeInput: () => void;
    currentStepIndex: number;
    setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    createExportString: () => string;
    onImport: (encoded: string) => void;
};

export type ClosestPairInputState = {
    points: Point[];
    timestamp: number;
};

export type ClosestPairRequest = ClosestPairInputState

export type ClosestPairOutputState = {
    steps: AlgorithmStepDTO[];
    timestamp: number;
};

export type RingStyle = "none" | "active" | "candidate";

export type XPointProps = {
    point: Point;
    visualGroupRef: React.RefObject<SVGGElement | null>;
    currentMarkerRef: React.RefObject<SVGCircleElement | null>;
    pointVisualRef: React.RefObject<SVGGElement | null>;
    activeRingRef: React.RefObject<SVGCircleElement | null>;
    candidateRingRef: React.RefObject<SVGCircleElement | null>;
};

export type XPointWithCordsProps = {
    point: Point;
    registerPointRefsInMap?: (pointId: string, refs: PointVisualRefs | null) => void; //"?" damit DynamicPoints auch benutzen kann, weil die keine refs braucht
};

export type PointVisualRefs = {
    group: SVGGElement; //ist das SVG <g> element, das nur X und Ringe enthält.
    pointVisual: SVGGElement;
    currentMarker: SVGCircleElement;
    activeRing: SVGCircleElement;
    candidateRing: SVGCircleElement;
};

export type PointVisualState = {
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