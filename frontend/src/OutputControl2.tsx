import type {OutputControlProps2} from "./Types";
import {btnStyle} from "./Utils.tsx";

export function OutputControl2(props: OutputControlProps2) {
    const isAtStart = props.currentStep === 0;
    const isAtEnd = props.currentStep >= props.stepCount - 1;

    const goBack = () => {
        props.setIsPlaying(false);
        props.setCurrentStep((prev:number) => prev - 1);
    };

    const goNext = () => {
        props.setIsPlaying(false);
        props.setCurrentStep((prev:number) => prev + 1);
    };

    const togglePlay = () => {
        props.setIsPlaying((prev:boolean) => !prev);
    };

    const reset = () => {
        props.setIsPlaying(false);
        props.setCurrentStep(0);
    };

    return (
        <div style={{display: "flex", gap: 3}}>
            <button onClick={goBack} disabled={isAtStart} style={btnStyle}>
                ← Back
            </button>

            <button onClick={togglePlay} disabled={isAtEnd} style={btnStyle}>
                {props.isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>

            <button onClick={goNext} disabled={isAtEnd} style={btnStyle}>
                Next →
            </button>

            <button onClick={reset} disabled={isAtStart} style={btnStyle}>
                ⏮ Reset
            </button>
        </div>
    );
}