import type { Dispatch, RefObject, SetStateAction } from "react";
import type { AnimationResponse } from "../shared/Types.tsx";

export type SVGOutputProps = {
    output: AnimationResponse,
    progress: number,
    setProgress:  Dispatch<SetStateAction<number>>,
    stepIndex: number,
    setStepIndex:  Dispatch<SetStateAction<number>>,
    onChangeInput: () => void;
    createExportString: () => string;
};

export type OutputControlProps = {
    isPlaying: boolean,
    setIsPlaying: Dispatch<SetStateAction<boolean>>,
    progress: number,
    setProgress: Dispatch<SetStateAction<number>>,
    stepIndex: number,
    setStepIndex:  Dispatch<SetStateAction<number>>,
    labels: string[],
    tlRef: RefObject<gsap.core.Timeline>,
}