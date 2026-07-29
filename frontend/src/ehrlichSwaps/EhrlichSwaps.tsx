import { useRef, useState } from "react";
import { SwapInput } from "./input/Input.tsx";
import { SwapOutput } from "./output/Output.tsx";
import {type EhrlichSwapStepDTO, sendSwapInput} from "./Api.ts";
import {extractEnteredValues, removeExtraEmptyFieldAtEnd, validateValues} from "./input/InputUtils.ts";
import "./EhrlichStyle.css";

const MAX_CELL_COUNT = 5;

export type SwapInputField = {
    id: number;
    value: string;
};

export default function EhrlichSwaps () {
    const nextFieldId = useRef(1);
    const [modeState, setModeState] = useState<"input" | "output">("input");
    const [fields, setFields] = useState<SwapInputField[]>([{id: 0, value: ""}]);
    const [submittedValues, setSubmittedValues] = useState<string[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);

    const [ehrlichSwapsSteps, setEhrlichSwapsSteps] = useState<EhrlichSwapStepDTO[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);


    const createEmptyField = (): SwapInputField => {
        const newField = {id: nextFieldId.current, value: ""};
        nextFieldId.current += 1;
        return newField;
    };

    const replaceFieldValue =
        (fieldsToUpdate: SwapInputField[], fieldId: number, newValue: string): SwapInputField[] => {

        return fieldsToUpdate.map((field) => {
            if (field.id !== fieldId){
                return field;
            }
            return {...field, value: newValue,};
        });
    };

    const appendEmptyField = (currentFields: SwapInputField[]): SwapInputField[] => {
        const lastFieldIsFilled = currentFields[currentFields.length - 1].value.trim() !== "";
        if (lastFieldIsFilled && currentFields.length < MAX_CELL_COUNT) {
            return [...currentFields, createEmptyField()];
        }
        return currentFields;
    };

    const updateFieldValue = (fieldId: number, newValue: string): void => {
        setValidationError(null);
        setFields((previousFields) => {
            const updatedFields = replaceFieldValue(previousFields, fieldId, newValue);
            return appendEmptyField(removeExtraEmptyFieldAtEnd(updatedFields));
        });
    };

    const deleteField = (fieldId: number): void => {
        setValidationError(null);

        setFields((previousFields) => {
            const remainingFields = previousFields.filter((field) => field.id !== fieldId);
            if (remainingFields.length === 0) return [createEmptyField()];
            const cleanedFields = removeExtraEmptyFieldAtEnd(remainingFields);
            return appendEmptyField(cleanedFields);
        });
    };

    const handleSubmit = async (): Promise<void> => {
        setValidationError(null);
        const enteredValues = extractEnteredValues(fields);
        const validationMessage = validateValues(enteredValues);
        if (validationMessage !== undefined) {
            setValidationError(validationMessage);
            return;
        }
        setEhrlichSwapsSteps([]);

        try {
            const response = await sendSwapInput(enteredValues);
            setSubmittedValues(enteredValues);
            setEhrlichSwapsSteps(response);
            setModeState("output");
            setCurrentStep(0);
            setProgress(0);
        } catch (error) {
            console.error(error);
            setValidationError("Input could be processed");
        }
    };

    const handleChangeInput = (): void => {setModeState("input");};
    const canSubmit = extractEnteredValues(fields).length > 1;

    if (modeState === "input") {
        return (
            <div className="algorithm-shell">
                <SwapInput
                    fields={fields}
                    canSubmit={canSubmit}
                    validationError={validationError}
                    onUpdateValue={updateFieldValue}
                    onDeleteField={deleteField}
                    onSubmit={handleSubmit}
                    onChangeInput={handleChangeInput}
                />
            </div>
        );
    }

    return (
        <div className="algorithm-shell">
            <SwapOutput
                values={submittedValues}
                steps={ehrlichSwapsSteps}
                onChangeInput={handleChangeInput}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                progress={progress}
                setProgress={setProgress}
            />
        </div>
    );
}