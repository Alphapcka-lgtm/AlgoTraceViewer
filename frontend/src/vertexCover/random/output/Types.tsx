import type { Dispatch, SetStateAction } from "react";
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