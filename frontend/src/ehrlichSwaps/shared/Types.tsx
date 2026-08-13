import type {CommonOutputProps} from "../../shared/Types.tsx";

export type EhrlichSwapsRequest = {
    inputValues: string[];
    timestamp: number;
}

export type SVGOutputProps = {
    values: string[];
    steps: EhrlichSwapStepDTO[];
    cProps: CommonOutputProps;
}

export type EhrlichSwapStepDTO = {
    description: string;
    valuesBefore: string[];
    valuesAfter: string[];
    bBefore: number[];
    bAfter: number[];
    k: number;
    swapIndex: number;
    swappedLeftValue: string;
    swappedRightValue: string;
};

export type SwapInputField = {
    id: number;
    value: string;
};