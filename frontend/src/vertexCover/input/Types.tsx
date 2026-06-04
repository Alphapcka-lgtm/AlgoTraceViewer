import type { AnimationRequest, Node } from "../shared/Types.tsx";
import type { Dispatch, SetStateAction } from "react";

export type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: string }
    | { type: "drawing-edge"; fromId: string; to?: { x: number; y: number }
};

export type SVGInputProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    onSubmit: () => void;
    onImport: (encoded: string) => void;
};

export type InputControlProps = {
    input: AnimationRequest,
    setInput: Dispatch<SetStateAction<AnimationRequest>>,
    setInteraction: Dispatch<SetStateAction<Interaction>>,
};

export type PreviewEdgeProps = {
    interaction: Interaction,
    nodes: Node[],
};