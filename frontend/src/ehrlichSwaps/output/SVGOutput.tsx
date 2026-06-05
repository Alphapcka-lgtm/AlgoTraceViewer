import {
    createStepLabels,
    getStepIndexFromTimeline,
} from "../../sweepLine/shared/Utils.tsx";
import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";

import gsap from "gsap";
import {IOModeTabs} from "../../sweepLine/shared/IOModeTabs.tsx";
import {OutputControl4} from "../../sweepLine/output/OutputControl4.tsx";
import type {SVGOutputProps} from "./Types.tsx";
import MotionPathPlugin from "gsap/MotionPathPlugin";

const STEP_DURATION = 0.5;

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3);

    gsap.registerPlugin(MotionPathPlugin)

    const a = ["a", "b", "c", "d"];

    const b = [0, 1, 2, 3];

    const k4 = [1, 2, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 2, 1, 3, 1, 2, 1, 2, 1]

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
    };



    const rectWidth = 300;

    const swap = (from: number, to: number) => {
        if(from < to){
            return "M0,0 L0,100 L" + (to-from)*rectWidth + ",100 L" + (to-from)*rectWidth + ",0"
        } else {
            return "M0,0 L0,-100 L" + (to-from)*rectWidth + ",-100 L" + (to-from)*rectWidth + ",0"

        }
    }

    useGSAP(() => {

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = tlRef.current;
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        timeline.addLabel(labels[0]);

        timeline.to("#idb1", {
            motionPath: {
                path: swap(1,3),
            },
        });

        timeline.to("#idb3", {
            motionPath: {
                path: swap(3,1),
            },
        }, "<");

        timeline.addLabel(labels[1]);

        timeline.to("#idb0", {
            motionPath: {
                path: swap(0,2),
            },
        });

        timeline.to("#idb2", {
            motionPath: {
                path: swap(2,0),
            },
        }, "<");

        timeline.addLabel(labels[2]);

        tlRef.current = timeline;

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
        };
    }, {dependencies: [props.output.timestamp]});

    return <div className="algorithm-panel">
        <IOModeTabs
            mode="output"
            onChangeInput={props.onChangeInput}
            onSubmit={() => {}}
            canSubmit={false}
        />
        <svg className="algorithm-canvas" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" >
            {a.map((element, index) => {
                return <g id={"ida" + index}>
                    <rect
                        x={100 + index * rectWidth}
                        y={100}
                        width={rectWidth}
                        height={100}
                        stroke="black"
                        fill="white"
                    />
                    <text x={110 + index * rectWidth} y={130}>{element}</text>
                </g>
            })}
            {b.map((element, index) => {
                return <g id={"idb" + index}>
                    <rect
                        x={100 + index * rectWidth}
                        y={500}
                        width={rectWidth}
                        height={100}
                        stroke="black"
                        fill="white"
                    />
                    <text x={110 + index * rectWidth} y={530}>{element}</text>
                </g>
            })}
        </svg>
        <OutputControl4
            timelineRef={tlRef}
            labels={labels}
            currentStep={props.stepIndex}
            setCurrentStep={props.setStepIndex}
            stepCount={props.output.intermediateStates.length + 2}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            progress={props.progress}
            setProgress={props.setProgress}
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={changePlaybackSpeed}
        />
        <div className="step-info">
            <div className="step-info-grid">
                <div><strong>Step:</strong> {props.stepIndex} / {labels.length - 1}</div>
            </div>
        </div>
    </div>;
}