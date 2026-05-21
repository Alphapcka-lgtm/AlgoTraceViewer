import type {OutputControlProps4} from "./Types";
import {btnStyle} from "./Utils.tsx";
import gsap from "gsap";

export function OutputControl4(props: OutputControlProps4) {
    const isAtStart = props.currentStep === 0;
    const isAtEnd = props.currentStep >= props.labels.length - 1;

    const tweenToStep = (targetStep: number) => {
        const tl = props.timelineRef.current;
        if(!tl) return;

        const targetLabel = props.labels[targetStep];
        if(!targetLabel) return;

        props.setIsPlaying(false); //wenn im autoplay auf next/back geklickt wird autoplay bendet

        gsap.killTweensOf(tl);

        tl.tweenTo(targetLabel, {
            onComplete: () => {
                props.setCurrentStep(targetStep);
            }
        });
    };

    const goBack = () => {
        if(isAtStart) return;
        tweenToStep(props.currentStep-1);
    };

    const goNext = () => {
        if(isAtEnd) return;
        tweenToStep(props.currentStep+1);
        //tl.tweenTo(tl.nextLabel());
    };

    const togglePlay = () => {
        const tl = props.timelineRef.current;
        if(!tl) return;

        gsap.killTweensOf(tl);

        if (tl.progress() >= 0.9999) {
            tl.restart();
            props.setIsPlaying(true);
            return;
        }

        if(!tl.paused()){
            tl.pause();
            props.setIsPlaying(false);
            return;
        }

        tl.play();
        props.setIsPlaying(true);
    };

    const reset = () => {
        const tl = props.timelineRef.current;
        if(!tl) return;
        gsap.killTweensOf(tl);
        //tl.restart();
        tl.pause(0);
        props.setCurrentStep(0);
        props.setIsPlaying(false);
        props.setProgress(0); //für scrubber
    };

    const scrub = (value: number) => {
        const tl = props.timelineRef.current;
        if (!tl) return;
        gsap.killTweensOf(tl);
        tl.pause();
        tl.progress(value);
        props.setProgress(value);
        props.setIsPlaying(false);
    };

    return (
        <div>
            <div style={{display: "flex", gap: 3}}>
                <button onClick={goBack} disabled={isAtStart} style={btnStyle}>
                    ← Back
                </button>

                <button onClick={togglePlay} style={btnStyle}>
                    {props.isPlaying ? "⏸ Pause" : isAtEnd ? "↻ Replay" : "▶ Play"}
                </button>

                <button onClick={goNext} disabled={isAtEnd} style={btnStyle}>
                    Next →
                </button>

                <button onClick={reset} disabled={isAtStart} style={btnStyle}>
                    ⏮ Reset
                </button>
            </div>

            <input
                type="range" min={0} max={1} step="any" value={props.progress}
                onInput={(e) => scrub(e.currentTarget.valueAsNumber)}
                style={{width: "98%", marginTop:"8px", accentColor: "red", height: "40px", cursor: "pointer"}}
            />
        </div>

    );
}