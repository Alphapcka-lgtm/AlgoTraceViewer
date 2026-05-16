import type {OutputControlProps4} from "./Types";
import {btnStyle} from "./Utils.tsx";
import gsap from "gsap";

export function OutputControl4(props: OutputControlProps4) {

    const tl = props.timelineRef.current;

    const isAtStart = props.currentStep === 0;
    const isAtEnd = props.currentStep >= props.labels.length - 1;

    const tweenToStep = (targetStep: number) => {
        if(!tl) return;

        const targetLabel = props.labels[targetStep];
        if(!targetLabel) return;

        props.setIsPlaying(false);

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
        if(props.isPlaying) {
            tl.pause();
            props.setIsPlaying(false);
            return;
        } else{
            tl.play();
            props.setIsPlaying(true);
            return;
        }
    };

    const reset = () => {
        tl.pause(0);
        props.setIsPlaying(false);
        //props.setCurrentStep(0);
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