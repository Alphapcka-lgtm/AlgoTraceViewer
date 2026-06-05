import {IOModeTabs} from "../../sweepLine/shared/IOModeTabs.tsx";
import type {EhrlichSwapStepDTO} from "../Api.ts";
import React, {useMemo, useRef, useState} from "react";
import {OutputControl4} from "../../sweepLine/output/OutputControl4.tsx";
import {createStepLabels, getStepIndexFromTimeline} from "../../sweepLine/shared/Utils.tsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import MotionPathPlugin from "gsap/MotionPathPlugin";

type SwapOutputProps = {
    values: string[];
    steps: EhrlichSwapStepDTO[];
    onChangeInput: () => void;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}

gsap.registerPlugin(MotionPathPlugin);

const STEP_DURATION = 0.8;
const SVG_WIDTH = 1920;
const SVG_HEIGHT = 1080;
const START_X = 140; //wo die erste box beginnt
const A_Y = 180; //in welcher "zeile" das a array angezigt wird
const B_Y = 560;  //in welcher "zeile" das b array angezigt wird
const BOX_WIDTH = 160;
const BOX_HEIGHT = 90;
const GAP = 24; //Abstand zwischen zwei Boxen..

function getBoxX(index: number): number {
    return START_X + index * (BOX_WIDTH + GAP);
}

function boxId(prefix: string, index: number): string {
    return `${prefix}-${index}`;
}

export function SwapOutput(props: SwapOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline({paused: true}));
    const lastProgressUpdateRef = useRef(0);
    const labels = useMemo(() => createStepLabels(props.steps.length), [props.steps.length]);
    const step: EhrlichSwapStepDTO | undefined = props.steps[props.currentStep];
    const initialValues = props.steps[0]?.valuesBefore ?? [];
    const initialB = props.steps[0]?.bBefore ?? [];

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    useGSAP(() => {
        if (props.steps.length === 0) return;
        timelineRef.current?.kill();

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = timelineRef.current;
                const now = performance.now();
                if (now - lastProgressUpdateRef.current > 100) {
                    props.setProgress(tl.progress());
                    lastProgressUpdateRef.current = now;
                }
                const stepIndex = getStepIndexFromTimeline(tl, labels);
                props.setCurrentStep(stepIndex);
            },
            onComplete: () => {
                props.setProgress(1);
                setIsPlaying(false);
            },
        });


        timelineRef.current = timeline;
        timeline.progress(props.progress).pause();
        timeline.timeScale(playbackSpeed);
        setIsPlaying(false);
        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true});
        };
    }, {
        dependencies: [props.steps],
    });
    if (!step) {
        return <></>;
    }
    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {
                }}
                canSubmit={false}
            />
            <svg
                className="algorithm-canvas"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <text x={START_X} y={A_Y - 40} fontSize="30" fontFamily="monospace">
                    a bzw. input
                </text>

                {initialValues.map((value, index) => (
                    <g id={boxId("a", index)} key={boxId("a", index)}>
                        <rect
                            x={getBoxX(index)}
                            y={A_Y}
                            width={BOX_WIDTH}
                            height={BOX_HEIGHT}
                            stroke="black"
                            strokeWidth="3"
                            fill="white"
                            rx="10"
                        />
                        <text
                            x={getBoxX(index) + BOX_WIDTH / 2}
                            y={A_Y + BOX_HEIGHT / 2}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="28"
                            fontFamily="monospace"
                        >
                            {value}
                        </text>
                    </g>
                ))}

                <text x={START_X} y={B_Y - 40} fontSize="30" fontFamily="monospace">
                    b
                </text>
                {initialB.map((value, index) => (
                    <g id={boxId("b", index)} key={boxId("b", index)}>
                        <rect
                            x={getBoxX(index)}
                            y={B_Y}
                            width={BOX_WIDTH}
                            height={BOX_HEIGHT}
                            stroke="black"
                            strokeWidth="3"
                            fill="white"
                            rx="10"
                        />
                        <text
                            x={getBoxX(index) + BOX_WIDTH / 2}
                            y={B_Y + BOX_HEIGHT / 2}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize="28"
                            fontFamily="monospace"
                        >
                            {value}
                        </text>
                    </g>
                ))}
            </svg>

            <OutputControl4
                timelineRef={timelineRef}
                labels={labels}
                currentStep={props.currentStep}
                setCurrentStep={props.setCurrentStep}
                stepCount={props.steps.length}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.progress}
                setProgress={props.setProgress}
                playbackSpeed={playbackSpeed}
                onPlaybackSpeedChange={changePlaybackSpeed}
            />
            <div className="step-info">
                <div className="step-description">
                    {step.description}
                </div>
                <div className="step-info-grid">
                    <div>
                        <strong>Step:</strong> {props.currentStep + 1} / {props.steps.length}
                    </div>
                    <div>
                        <strong>k:</strong> {step.k}
                    </div>
                    <div>
                        <strong>Swap index:</strong>{" "}
                        {step.swapIndex < 0 ? "—" : step.swapIndex}
                    </div>
                    <div>
                        <strong>Values before:</strong> {step.valuesBefore.join(", ")}
                    </div>
                    <div>
                        <strong>Values after:</strong> {step.valuesAfter.join(", ")}
                    </div>
                    <div>
                        <strong>b before:</strong> {step.bBefore.join(", ")}
                    </div>
                    <div>
                        <strong>b after:</strong> {step.bAfter.join(", ")}
                    </div>
                </div>
            </div>
        </div>

    );

}


/*
export function SwapOutput(props: SwapOutputProp) {

    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {}}
                canSubmit={false}
            />

        </div>
    );
}

 */