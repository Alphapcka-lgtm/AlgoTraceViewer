import {useState} from "react";
import {sendSwapInput} from "../sweepLine/Api.tsx";

export function SwapInput() {
    const [values, setValues] = useState<string[]>([""]);
    const [ehrlichSwapsSteps, setEhrlichSwapsSteps] = useState<string[]>([]);

    const addField = () => {
        setValues((previousValues) => {
            return [...previousValues, ""];
        });
    };

    const removeLastField = () => {
        setValues((previousValues) => {
            if (previousValues.length <= 1) return previousValues;
            return previousValues.slice(0, previousValues.length - 1);
        });
    };

    const updateValue = (index: number, newValue: string) => {
        setValues((previousValues) => {
            return previousValues.map((oldValue, currentIndex) => {
                if (currentIndex === index) return newValue;
                return oldValue;
            });
        });
    };

    const submitValues = async () => {
        setEhrlichSwapsSteps([]);

        try {
            const response = await sendSwapInput(values);

            setEhrlichSwapsSteps(response.inputValues);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{fontFamily: "monospace", marginTop: 20}}>
            <div className="control-row">
                <button className="control-button" type="button" onClick={addField}> + </button>
                <button className="control-button" type="button"  onClick={removeLastField} disabled={values.length <= 1}> - </button>
                <button className="control-button" type="button" onClick={submitValues}> Submit </button>
            </div>

            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                {values.map((value, index) => {
                    return (
                        <div
                            key={index} style={{
                                width: 80,
                                height: 55,
                                border: "2px solid black",
                                borderRadius: 10,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "rgba(240, 240, 240, 0.8)",
                            }}
                        >
                            <input
                                value={value}
                                onChange={(event) => {updateValue(index, event.currentTarget.value);}}
                                style={{
                                    width: 60,
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    textAlign: "center",
                                    fontFamily: "monospace",
                                    fontSize: 20,
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {ehrlichSwapsSteps.length > 0 && (
                <div style={{marginTop: 16}}><strong>Backend received:</strong> {ehrlichSwapsSteps.join(", ")}</div>
            )}
        </div>
    );
}