import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
//import React from "react";

type SwapInputProps = {
    values: string[];
    onAddField: () => void;
    onRemoveLastField: () => void;
    onUpdateValue: (index: number, newValue: string) => void;
    onSubmit: () => void;
    onChangeInput: () => void;
};

export function SwapInput(props: SwapInputProps) {

    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="input"
                onChangeInput={props.onChangeInput}
                onSubmit={props.onSubmit}
                canSubmit={props.values.length >= 1}
            />


            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {props.values.map((value, index) => (
                    <div
                        key={index}
                        style={{
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
                            onChange={(event) =>
                                props.onUpdateValue(index, event.currentTarget.value)
                            }
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
                ))}
            </div>

            <div className="control-row">
                <button className="control-button" type="button" onClick={props.onAddField}>
                    +
                </button>

                <button className="control-button" type="button" onClick={props.onRemoveLastField} disabled={props.values.length <= 1}>
                    -
                </button>
            </div>
        </div>
    );
}