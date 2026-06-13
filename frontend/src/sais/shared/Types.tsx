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
    bucketSizes: number[],
    typeMapDto: TypeMapDto,
    guessLmsSteps: SortStepDto[],
    guessInduceL: SortStepDto[],
    guessInduceS: SortStepDto[],
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

export type SortStepDto = {
    sourceIndex: number,
    bucketIndex: number,
}

export type TypeMapDto = {
    map: TypeDto[],
    lmsCount: number,
}

export type TypeDto = {
    type: Type,
    isLms: boolean,
}

export type Type = {
    value: string
}