import type { AnimationRequest } from "../shared/Types.tsx";
import type { Dispatch, SetStateAction } from "react";

export type SVGInputProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    onSubmit: () => void;
};