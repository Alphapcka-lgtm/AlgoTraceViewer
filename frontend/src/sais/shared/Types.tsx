import type {Dispatch, SetStateAction} from "react";

export type SaisInputProps = {
    height: number,
    width: number,
    onSubmit: () => void;
    onChangeInput: () => void;
    value: string,
    onUpdateValue: (newValue: string) => void;
}

export type SaisOutputProps = {
    output: SaisResponseDto,
    progress: number,
    setProgress: Dispatch<SetStateAction<number>>,
    stepIndex: number,
    setStepIndex: Dispatch<SetStateAction<number>>,
    onChangeInput: () => void;
    createExportString: () => string;
    onImport: (encoded: string) => void;
}

export type SaisRequestDto = {
    source: string,
    timestamp: number,
}

export type SaisResponseDto = {
    source: string,
    bucketSizes: BucketSize[],
    typeMapDto: TypeMapDto,
    guessLmsSteps: SortStepDto[],
    guessInduceL: SortStepDto[],
    guessInduceS: SortStepDto[],
    guessedSa: number[],
    lmsOrder: number[],
    lmsNames: number[],
    lmsPositions: number[],
    reduced: number[],
    reducedSorted: number[],
    saLmsAdded: number[],
    saInduceL: SortStepDto[],
    saInduceS: SortStepDto[],
    sa: number[],
    timestamp: number,
}

export type BucketSize = {
    c: string,
    size: number,
}

export type SortStepDto = {
    sourceIndex: number,
    bucketIndex: number,
    resultingArray: number[],
}

export type TypeMapDto = {
    map: TypeDto[],
    lmsCount: number,
}

export type TypeDto = {
    type: string,
    isLms: boolean,
}

export type Step = {
    phaseLabel: string,
    title: string,
    description: string,
    kind: StepKind,
    frameIndex?: number, // index into the relevant SortStepDto[] for *-frame kinds
}

export type StepKind =
    | "intro"
    | "guess-lms-frame"
    | "guess-induce-l-frame"
    | "guess-induce-s-frame"
    | "naming"
    | "reduced"
    | "place-lms-frame"
    | "sa-induce-l-frame"
    | "sa-induce-s-frame"
    | "final";

export type SvgCellData = {
    label: string;
    sub?: string;
    bg?: string;
    border?: string;
    color?: string;
    bold?: boolean;
    ringColor?: string;
    ringWidth?: number;
}