import {tabStyle} from "./Utils.tsx";
import type {ModeTabsProps} from "./Types.tsx";

export function IOModeTabs(props: ModeTabsProps) {
    const inputActive = props.mode === "input";
    const outputActive = props.mode === "output";

    return (
        <div
            style={{
                display: "flex",
                marginTop: "20px",
                marginBottom: "5px",
                gap: 4,
            }}
        >
            <button
                onClick={props.onChangeInput}
                disabled={inputActive}
                style={tabStyle(inputActive, inputActive)}
            >
                Input
            </button>

            <button
                onClick={props.onSubmit}
                disabled={outputActive || !props.canSubmit}
                style={tabStyle(outputActive, outputActive || !props.canSubmit)}
            >
                Output
            </button>
        </div>
    );
}