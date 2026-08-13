import React from "react";
import type {VertexCoverRequest} from "../vertexCover/shared/Types.tsx";
import type {ClosestPairRequest, Point} from "../closestPair/shared/Types.tsx"
import type {EhrlichSwapsRequest, SwapInputField} from "../ehrlichSwaps/shared/Types.tsx";

export type OutputControlsProps = {
    timelineRef: React.RefObject<gsap.core.Timeline>
    labels: string[];
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    isPlaying: boolean;
    setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    playbackSpeed: number;
    onPlaybackSpeedChange: (speed: number) => void;
};

export type ModeTabsProps = {
    mode: "input" | "output";
    onChangeInput: () => void;
    onSubmit: () => void;
    canSubmit: boolean;
};

export type ExportState =
    | { algorithm: "closestPair",  progress: number, input: Point[] }
    | { algorithm: "vertexCover",  progress: number, input: VertexCoverRequest }
    | { algorithm: "ehrlichSwaps", progress: number, input: SwapInputField[]};

export type PseudoCodeLine = {
    id: string;
    text: string;
    indent?: number;
};

export type PseudoCodePanelProps = {
    lines: PseudoCodeLine[];
    activeLineIds: string[];
};

export type AlgorithmType = "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";
export type Tab = "homepage" | AlgorithmType;

export type HomepageProps = {
    activeTab: Tab;
}

export type AnimationRequest = EhrlichSwapsRequest | VertexCoverRequest | ClosestPairRequest

export type CommonOutputProps = {
    onChangeInput: () => void;
    currentStepIndex: number;
    setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
    createExportString: () => string;
    onImport: (encoded: string) => void;
}

export type Preset = {
    request: AnimationRequest;
    algorithm: string;
    name: string;
};

export type PresetSelectProps = {
    algorithm: string;
    setInput: (input: AnimationRequest) => void,
    getInput: () => AnimationRequest;
};