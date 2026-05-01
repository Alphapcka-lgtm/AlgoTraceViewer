import type { Dispatch, RefObject, SetStateAction } from "react";
import type { AnimationResponse } from "../shared/Types.tsx";

export type SVGOutputProps = {
    output: AnimationResponse,
    mode: string,
    progress: number,
    setProgress:  Dispatch<SetStateAction<number>>,
};

export type OutputControlProps = {
    isPlaying: boolean,
    setIsPlaying: Dispatch<SetStateAction<boolean>>,
    progress: number,
    setProgress: Dispatch<SetStateAction<number>>,
    tlRef: RefObject<gsap.core.Timeline>
}