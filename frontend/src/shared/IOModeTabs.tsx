import type {ModeTabsProps} from "./Types.tsx";

export function IOModeTabs(props: ModeTabsProps) {
    const inputActive = props.mode === "input";
    const outputActive = props.mode === "output";

    return (
        <div className="mode-tabs">
            <button
                onClick={props.onChangeInput}
                disabled={inputActive}
                className={`mode-tab ${inputActive ? "is-active" : ""}`}
            >
                Input
            </button>

            <button
                onClick={props.onSubmit}
                disabled={outputActive || !props.canSubmit}
                className={`mode-tab ${outputActive ? "is-active" : ""}`}
            >
                Output
            </button>
        </div>
    );
}