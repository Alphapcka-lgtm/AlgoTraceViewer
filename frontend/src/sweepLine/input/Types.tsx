import type { AnimationRequest } from "../shared/Types.tsx";
import type { Dispatch, SetStateAction } from "react";

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string };

export type SVGInputProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    mode: string,
};

export type InputControlProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    setInteraction: Dispatch<SetStateAction<Interaction>>,
};