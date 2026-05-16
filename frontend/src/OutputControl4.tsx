import type {OutputControlProps4} from "./Types";
import {btnStyle} from "./Utils.tsx";

export function OutputControl4(props: OutputControlProps4) {

    const tl = props.timelineRef.current;

    const isAtStart = props.currentStep === 0;
    const isAtEnd = props.currentStep >= tl.lables.length - 1;

    const tweenToStep = (targetStep: number) => {
        if(!tl) return;

        const targetLabel = tl.lables[targetStep];
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
    };

    const togglePlay = () => {
        if(props.isPlaying) {
            tl.pause();
            props.setIsPlaying(false);
            return;
        }

        props.setIsPlaying(true);

        const playNext = (step:number) => {
            const nextStep = step+1;
            const nextLabel = tl.lables[nextStep];
            if(!nextLabel){
                props.setIsPlaying(false);
                return;
            }

            tl.tweenTo(nextLabel, {
                onComplete: () => {
                    props.setCurrentStep(nextStep);
                    if(nextStep >= tl.lables.length - 1) {
                        props.setIsPlaying(false);
                    } else {
                        playNext(nextStep);
                    }
                }
            });
        };

        playNext(props.currentStep);
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