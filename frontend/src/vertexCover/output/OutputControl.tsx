import type { OutputControlProps } from "./Types.tsx";
import gsap from "gsap";

export function OutputControl(props: OutputControlProps){

    const tweenToStep = (targetStep: number) => {
        const tl = props.tlRef.current;
        if(!tl) return;

        const targetLabel = props.labels[targetStep];
        if(!targetLabel) return;

        props.setIsPlaying(true);

        gsap.killTweensOf(tl);

        tl.tweenTo(targetLabel, {
            onComplete: () => {
                props.setStepIndex(targetStep);
                props.setIsPlaying(false)
            }
        });
    };

    const jumpToPreviousStep = () => {
        if(props.tlRef.current.progress() <= 0) return;
        tweenToStep(props.stepIndex-1);
    }

    const stopAnimation = () => {
        props.tlRef.current.pause();
        props.setIsPlaying(false);
    }

    const startAnimation = () => {
        if (props.progress >= 1){
            props.tlRef.current.play(0);
        } else {
            props.tlRef.current.play();
        }
        props.setIsPlaying(true);
    }

    const jumpToNextStep = () => {
        if(props.tlRef.current.progress() >= 1) return;
        tweenToStep(props.stepIndex+1);
    }

    const resetAnimation = () => {
        if (props.isPlaying){
            props.setIsPlaying(false);
        }
        props.tlRef.current.pause(0);
        props.setProgress(0);
        props.setStepIndex(0);
    }

    return <div style={ { display: "flex", flexDirection: "column", gap: 3 } } >
        <div style={ { display: "flex", gap: 3 } } >
            <button onClick={ jumpToPreviousStep } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Previous Step</button>
            <button onClick={ props.isPlaying ? stopAnimation : startAnimation } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >{props.isPlaying ? "Pause" : "Play"}</button>
            <button onClick={ jumpToNextStep } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Next Step</button>
        </div>
        <button onClick={ resetAnimation } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Reset</button>
        <input type={ "range" } min={ 0 } max={ 1 } step={ "any" } value={ props.progress } onInput={ (e) => {
            if(props.isPlaying){
                props.setIsPlaying(false);
                props.tlRef.current.pause();
            }
            props.tlRef.current.progress(e.currentTarget.valueAsNumber);
        } } />
    </div>
}