import React from "react";
import type {AnimationRequest} from "../vertexCover/shared/Types.tsx";
import type {Node} from "../sweepLine/shared/Types.tsx"

export type OutputControlsProps = {
    timelineRef: React.RefObject<gsap.core.Timeline>
    labels: string[];
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    stepCount: number;
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
    | { algorithm: "sweepLine", progress: number, input: Node[] }
    | { algorithm: "vertexCover", progress: number, input: AnimationRequest };

export type PseudoCodeLine = {
    id: string;
    text: string;
    indent?: number;
};

export type PseudoCodePanelProps = {
    lines: PseudoCodeLine[];
    activeLineIds: string[];
    title: string;
};