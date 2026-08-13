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
    activeLineIds: string[],
    setActiveLineIds: Dispatch<SetStateAction<string[]>>,
    stepDescription: string,
    setStepDescription: Dispatch<SetStateAction<string>>,
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
    lmsSortSteps: LmsSortStepDto[],
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
    stepDescription: string,
    induceSaIndex: number,
}

export type LmsSortStepDto = {
    sortedReducedIndex: number,
    lmsIndex: number,
    sourceIndex: number,
    bucketIndex: number,
    resultingSa: number[],
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

export type BucketRowProps = {
    cellWidth: number,
    cellHeight: number,
    bucketSizes: BucketSize[],
    xOffsetStart: number,
    yPos: number,
    nameColWidth: number,
    strokeWidth: number,
}

export type TypesRowProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    typeMap: TypeMapDto,
    source: string,
    nameColWidth: number,
    strokeWidth: number,
}

export type TextRowProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    typeMap: TypeMapDto,
    source: string,
    nameColWidth: number,
    strokeWidth: number,
}

export type IndexRowProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    source: string,
    nameColWidth: number,
    strokeWidth: number,
}

export type ReducedStringProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    lmsPositions: number[],
    reduced: number[],
    nameColWidth: number,
}

export type ReducedSortedStringProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    lmsPositions: number[],
    reducedSorted: number[],
    nameColWidth: number,
}

export type EmptySuffixArrayProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    boxCount: number,
    nameColWidth: number,
    counter: number,
}

export type LmsPositionsProps = {
    cellWidth: number,
    cellHeight: number,
    xOffsetStart: number,
    yPos: number,
    lmsPositions: number[],
    nameColWidth: number,
}