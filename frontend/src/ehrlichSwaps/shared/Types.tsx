import type {AnimationRequest, CommonOutputProps} from "../../shared/Types.tsx";

export type EhrlichSwapsRequest = {
    inputFields: SwapInputField[];
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
export type SwapInputProps = {
    fields: SwapInputField[];
    canSubmit: boolean;
    validationError: string | null;
    onUpdateValue: (fieldId: number, newValue: string) => void;
    onDeleteField: (fieldId: number,) => void;
    onSubmit: () => void;
    onChangeInput: () => void;
    onPresetChange: (request: AnimationRequest) => void;
    createExportString: () => string;
    onImport: (encoded: string) => void;
    onReset: () => void;
};