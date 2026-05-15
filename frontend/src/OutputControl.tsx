import type {OutputControlProps} from "./Types";
import {btnStyle} from "./Utils.tsx";

export function OutputControl(props: OutputControlProps) {

    const stopAnimation = () => {
        props.tlRef.current.pause();
        props.setIsPlaying(false);
    };

    const startAnimation = () => {
        // Wenn am Ende: von vorne starten
        if (props.progress >= 1) {
            props.tlRef.current.play(0);
        } else {
            props.tlRef.current.play();
        }
        props.setIsPlaying(true);
    };

    const jumpToPreviousStep = () => {
        if (props.isPlaying) stopAnimation();

        // previousLabel sucht das nächste Label vor der aktuellen Position.
        // Kleiner Offset (-0.01) damit man nicht auf dem aktuellen Label stehen bleibt.
        const currentTime:number = props.tlRef.current.time();
        const seekTime:number = currentTime - 0.01 < 0 ? 0.01 : currentTime - 0.01;
        props.tlRef.current.seek(props.tlRef.current.previousLabel(seekTime));
        props.setProgress(props.tlRef.current.progress());
    };

    const jumpToNextStep = () => {
        if (props.isPlaying) stopAnimation();

        props.tlRef.current.seek(props.tlRef.current.nextLabel());
        props.setProgress(props.tlRef.current.progress());
    };

    const resetAnimation = () => {
        if (props.isPlaying) props.setIsPlaying(false);
        // pause(0) stoppt und springt an den Anfang
        props.tlRef.current.pause(0);
        props.setProgress(0);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", gap: 3 }}>
                <button onClick={jumpToPreviousStep} style={btnStyle} disabled={props.activeStepIndex === 0}>← Back</button>
                <button
                    onClick={props.isPlaying ? stopAnimation : startAnimation}
                    style={btnStyle}
                >
                    {props.isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button onClick={jumpToNextStep} style={btnStyle} disabled={props.activeStepIndex >= props.stepCount - 1}>Next →</button>
            </div>
            <button onClick={resetAnimation} style={btnStyle}>⏮ Reset</button>

            {/* Scrubber: progress(value) setzt die Timeline-Position direkt */}
            <input
                type="range"
                min={0}
                max={1}
                step="any"
                value={props.progress}
                onInput={(e) => {
                    const nextProgress = e.currentTarget.valueAsNumber;
                    props.tlRef.current.pause();
                    props.tlRef.current.progress(nextProgress);
                    props.setIsPlaying(false);
                    props.setProgress(nextProgress);
                    const nextStepIndex = Math.min(Math.round(nextProgress * (props.stepCount - 1)), props.stepCount - 1);
                    props.setActiveStepIndex(nextStepIndex);
                }}
            />


        </div>
    );
}

