import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import type {SaisInputProps} from "../shared/Types.tsx";

export function SaisInput(props: SaisInputProps) {
    return (
        <div className="algorithm-panel">
            {/* input/output tabs header */}
            <IOModeTabs mode={"input"} onChangeInput={props.onChangeInput} onSubmit={props.onSubmit} canSubmit={true}/>

            {/* input space */}
            <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
                <div
                    style={{
                        width: 180,
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
                        value={props.value}
                        onChange={(event) =>
                            props.onUpdateValue(event.currentTarget.value)
                        }
                        style={{
                            width: 160,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            textAlign: "left",
                            fontFamily: "monospace",
                            fontSize: 20,
                        }}
                    />
                </div>
            </div>

            {/* input control buttons */}
            <div className="control-row">
                <p>no controls yet</p>
            </div>
        </div>
    )
}