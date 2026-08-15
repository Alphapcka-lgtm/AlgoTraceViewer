import { useRef, useState } from "react";
import { SwapInput } from "./input/Input.tsx";
import { Output } from "./output/Output.tsx";
import { getEhrlichSwapSteps} from "./Api.ts";
import { extractEnteredValues, removeExtraEmptyFieldAtEnd, validateValues} from "./input/InputUtils.ts";
import "./EhrlichSwaps.css";
import type {EhrlichSwapsRequest, EhrlichSwapStepDTO, SwapInputField} from "./shared/Types.tsx";
import type {AnimationRequest, CommonOutputProps, ExportState} from "../shared/Types.tsx";
import {decodeExportState, encodeExportState} from "../shared/Utils.tsx";

const MAX_CELL_COUNT = 6;

export default function EhrlichSwaps () {
    const nextFieldId = useRef(1);
    const [loading, setLoading] = useState(false);
    const [modeState, setModeState] = useState<"input" | "output">("input");
    const [fields, setFields] = useState<SwapInputField[]>([{id: 0, value: ""}]);
    const [submittedValues, setSubmittedValues] = useState<string[]>([]);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [ehrlichSwapsSteps, setEhrlichSwapsSteps] = useState<EhrlichSwapStepDTO[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

    const calculateOutput = async (enteredValues: string[]): Promise<void> => {
        setValidationError(null);
        const validationMessage = validateValues(enteredValues);
        if (validationMessage !== undefined) {
            setValidationError(validationMessage);
            return;
        }
        setEhrlichSwapsSteps([]);
        setLoading(true);
        try {
            const steps = await getEhrlichSwapSteps(enteredValues);
            setSubmittedValues(enteredValues);
            setEhrlichSwapsSteps(steps);
        } catch (error) {
            console.error(error);
            setValidationError("Input could not be processed");
        } finally {
            setLoading(false);
        }
    };

    const inputUnchanged = (values: string[]): boolean =>
        values.length === submittedValues.length &&
        values.every((value, index) => value === submittedValues[index]);

    const handleSubmit = async (): Promise<void> => {
        const enteredValues = extractEnteredValues(fields);
        if (inputUnchanged(enteredValues)) {
            setModeState("output");
            return;
        }
        setProgress(0);
        setCurrentStepIndex(0);
        await calculateOutput(enteredValues);
        setModeState("output");
    };

    const createExportString = () => {
        return encodeExportState({algorithm: "ehrlichSwaps", input: fields, progress});
    };

    const handleChangeInput = (): void => {setModeState("input");};
    const canSubmit = extractEnteredValues(fields).length > 1;

    const handleImport = async (encoded: string): Promise<void> => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm !== "ehrlichSwaps") return;
            setProgress(imported.progress);
            setFields(imported.input);
            await calculateOutput(extractEnteredValues(imported.input));
            setModeState("output");
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    const handlePresetChange = (input: AnimationRequest) => {
        const myInput =  input as EhrlichSwapsRequest;
        setFields(myInput.inputFields);
    }

    const handleReset = () => {
        nextFieldId.current = 1;
        setFields([{ id: 0, value: "" }]);
    };

    if (modeState === "input") {
        return (
            <div className={`algorithm-shell ${loading ? "is-loading" : ""}`}>
                <SwapInput
                    fields={fields}
                    canSubmit={canSubmit}
                    validationError={validationError}
                    onUpdateValue={updateFieldValue}
                    onDeleteField={deleteField}
                    onSubmit={handleSubmit}
                    onChangeInput={handleChangeInput}
                    onImport={handleImport}
                    createExportString={createExportString}
                    onPresetChange={handlePresetChange}
                    onReset={handleReset}

                />
            </div>
        );
    }
    
    const cProps: CommonOutputProps = {
        progress: progress,
        setProgress: setProgress,
        currentStepIndex: currentStepIndex,
        setCurrentStepIndex: setCurrentStepIndex,
        onChangeInput: handleChangeInput,
        createExportString: createExportString,
        onImport: handleImport
    }

    return (
        <div className={`algorithm-shell ${loading ? "is-loading" : ""}`}>
            <Output
                values={submittedValues}
                steps={ehrlichSwapsSteps}
                cProps={cProps}
            />
        </div>
    );
}