import type {AlgorithmStepDTO, LineAttrs, PointVisualState, RectAttrs} from "../shared/Types.tsx";
import {SVG_HEIGHT} from "../../shared/Utils.tsx";
import {PADDING} from "./Output.tsx";
import {hasCurrentDisplayed, POINT_COLORS} from "../shared/Utils.ts";

export const getActiveAreaAttrs = (step: AlgorithmStepDTO ): RectAttrs => {
    const currentX = step.currentPoint?.x ?? 0;
    const delta = step.windowDelta;
    return {x: currentX - delta, y: PADDING, width: delta, height: SVG_HEIGHT - 2 * PADDING};
};

export const getSweepLineAttrs = (step: AlgorithmStepDTO): LineAttrs=> {
    const currentX = step.currentPoint?.x ?? 0;
    return {x1: currentX, x2: currentX, y1: PADDING, y2: SVG_HEIGHT - PADDING};
};

export const getCandidateRectAttrs = (step: AlgorithmStepDTO) => {
    const currentX = step.currentPoint?.x ?? 0;
    const currentY = step.currentPoint?.y ?? 0; // const currentY = step.currentPoint?.y ?? props.height / 2;

    return {x: currentX - step.windowDelta, y: currentY - step.windowDelta, width: step.windowDelta, height: step.windowDelta * 2};
};

export const getPointVisualState = (step: AlgorithmStepDTO, pointId: string): PointVisualState => {
    const isCurrent = hasCurrentDisplayed(step) && step.currentPoint?.id === pointId;
    const isCandidate = step.stepType === "CHECK_CANDIDATES" &&
        step.candidateComparisons.some(({candidate}) => candidate.id === pointId);
    const isActive = step.activePoints.some(point => point.id === pointId);
    const isBest = step.bestPair?.p0.id === pointId ||step.bestPair?.p1.id === pointId;
    const isProcessed = step.processedPoints.some(point => point.id === pointId);
    const isFuture = step.futurePoints.some(point => point.id === pointId);
    return {isCurrent, isCandidate, isActive, isBest, isProcessed, isFuture};
};

export const getPointColor = (state: PointVisualState): string => {
    if (state.isBest) return POINT_COLORS.closest;
    if (state.isProcessed) return POINT_COLORS.processed;
    if (state.isFuture) return POINT_COLORS.future;
    return POINT_COLORS.default;
};