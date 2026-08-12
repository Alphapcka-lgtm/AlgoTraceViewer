import React from "react";
import type {VertexCoverRequest} from "../vertexCover/shared/Types.tsx";
import type {ClosestPairRequest, Node} from "../closestPair/shared/Types.tsx"
import type {EhrlichSwapsRequest} from "../ehrlichSwaps/shared/Types.tsx";

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
    | { algorithm: "closestPair", progress: number, input: Node[] }
    | { algorithm: "vertexCover", progress: number, input: VertexCoverRequest };

export type PseudoCodeLine = {
    id: string;
    text: string;
    indent?: number;
};

export type PseudoCodePanelProps = {
    lines: PseudoCodeLine[];
    activeLineIds: string[];
};

export type Tab = "homepage" | "closestPair" | "suffixArray" | "vertexCover" | "ehrlichSwaps";

export type HomepageProps = {
    activeTab: Tab;
}

export type AnimationRequest = EhrlichSwapsRequest | VertexCoverRequest | ClosestPairRequest