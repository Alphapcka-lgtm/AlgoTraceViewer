import gsap from "gsap";
import type {OutputControlsProps} from "./Types.tsx";
import {
    ArrowLeft,
    ArrowRight,
    Play,
    Pause,
    RotateCcw,
    SkipBack, Info,
} from "lucide-react";
import {useState} from "react";
import { ControlsHelpDialog } from "./ControlsHelpDialog";

export function OutputControls(props: OutputControlsProps) {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
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
        <>
            <div className="control-row">
                <button
                    type="button"
                    title="Controls explained"
                    onClick={() => setIsHelpOpen(true)}
                    className="control-button icon-only"
                >
                    <Info size={20}/>
                </button>
                <select
                    value={props.playbackSpeed}
                    onChange={(e) => props.onPlaybackSpeedChange(Number(e.currentTarget.value))}
                    className="control-select"
                >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={2}>2x</option>
                </select>

                <button title="Back" onClick={goBack} disabled={isAtStart} className="control-button">
                    <ArrowLeft size={20}/>
                </button>

                <button onClick={togglePlay} className="control-button">
                    {props.isPlaying ? <Pause size={20}/> : isAtEnd ? <RotateCcw size={20}/> : <Play size={20}/> }
                </button>

                <button title="Next" onClick={goNext} disabled={isAtEnd} className="control-button">
                    <ArrowRight size={20}/>
                </button>

                <button title="Reset" onClick={reset} disabled={isAtStart} className="control-button">
                    <SkipBack size={20} />
                </button>

                <input
                    className="timeline-slider"
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={props.progress}
                    onInput={(e) => scrub(e.currentTarget.valueAsNumber)}
                />
            </div>

            {isHelpOpen && (
                <ControlsHelpDialog
                    onClose={() => setIsHelpOpen(false)}
                />
            )}
        </>
    );
}