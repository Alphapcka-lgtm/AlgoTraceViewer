import { useState } from "react";
import {SwapInput} from "./input/Input.tsx";
import {SwapOutput} from "./output/Output.tsx";
import {type EhrlichSwapStepDTO, sendSwapInput} from "./Api.ts";


export default function EhrlichSwaps() {
    const [modeState, setModeState] = useState("input");
    const [values, setValues] = useState<string[]>([""]);
    const [ehrlichSwapsSteps, setEhrlichSwapsSteps] = useState<EhrlichSwapStepDTO[]>([]);

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);    //für scrubber

    const addField = () => {
        setValues((previousValues) => [...previousValues, ""]);
    };

    const removeLastField = () => {
        setValues((previousValues) => {
            if (previousValues.length <= 1) return previousValues;
            return previousValues.slice(0, previousValues.length - 1);
        });
    };

    const updateValue = (index: number, newValue: string) => {
        setValues((previousValues) =>
            previousValues.map((oldValue, currentIndex) =>
                currentIndex === index ? newValue : oldValue
            )
        );
    };

    const handleSubmit  = async () => {
        setEhrlichSwapsSteps([]);

        try {
            const response = await sendSwapInput(values);

            console.log("swap result:", response);
            console.log("is array:", Array.isArray(response));

            setEhrlichSwapsSteps(response);
            setModeState("output");
            setProgress(0);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeInput = () => {
        setModeState("input");
    };


    if (modeState === "input") {
        return (
            <div className="algorithm-shell">
                <SwapInput
                    values={values}
                    onAddField={addField}
                    onRemoveLastField={removeLastField}
                    onUpdateValue={updateValue}
                    onSubmit={handleSubmit}
                    onChangeInput={handleChangeInput}
                />
            </div>
        );
    }

    return (
        <div className="algorithm-shell">
            <SwapOutput
                values={values}
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