
import type {VariantNavigationProps} from "./Types.tsx";

export function VariantNavigation(props: VariantNavigationProps) {
    return (
        <div className="mode-tabs">
            <button
                onClick={() => props.onTabChange("random")}
                disabled={props.disabled}
                className={`mode-tab ${props.variant == "random" ? "is-active" : ""}`}
            >
                Random
            </button>
            <button
                onClick={() => props.onTabChange("maxDegree")}
                disabled={props.disabled}
                className={`mode-tab ${props.variant == "maxDegree" ? "is-active" : ""}`}
            >
                Max Degree
            </button>
            <button
                onClick={() => props.onTabChange("staticList")}
                disabled={props.disabled}
                className={`mode-tab ${props.variant == "staticList" ? "is-active" : ""}`}
            >
                Static List
            </button>
        </div>)
}