import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";

import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import type {SVGOutputProps} from "../shared/Types.tsx";
import {IOModeTabs} from "../../sweepLine/shared/IOModeTabs.tsx";
import {Edges} from "../shared/Edges.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {OutputControl4} from "../../sweepLine/output/OutputControl4.tsx";
import {PseudoCodePanel} from "../../sweepLine/output/PseudoCodePanel.tsx";
import {getActiveLineIdsRandom, PSEUDOCODE_RANDOM} from "./PseudoCode.tsx";
import {ImportExportDialog} from "../../sweepLine/shared/ImportExportDialog.tsx";
import {createStepLabels, getStepIndexFromTimeline} from "../../sweepLine/shared/Utils.tsx";

const STEP_DURATION = 1.0;

export function RandomSVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3 * props.output.intermediateStates.length + 2);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
    };

    useGSAP(() => {

        gsap.registerPlugin(DrawSVGPlugin);

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

        tlRef.current = timeline;

        timeline.addLabel(labels[0]);

        props.output.initialState.edges.forEach((edge, index) => {
            if (index == 0) {
                timeline.set("#u0" + edge.id, {opacity: 100});
            } else {
                timeline.set("#u0" + edge.id, {opacity: 100}, "<");
            }
            timeline.from("#u0" + edge.id, {drawSVG: "50% 50%"}, "<");
        })

        timeline.addLabel(labels[1]);

        props.output.intermediateStates.forEach((intermediateState, index) => {

            timeline.set("#u1" + intermediateState.chosenEdge.id, {opacity: 100});
            timeline.from("#u1" + intermediateState.chosenEdge.id, {drawSVG: "50% 50%"}, "<");

            timeline.addLabel(labels[3 * index + 2]);

            intermediateState.chosenNodes.forEach((node, index) => {
                if(index === 0){
                    timeline.to("#u1" + node.id, {r: 20});
                    timeline.to("#u2" + node.id, {r: 18}, "<");
                    timeline.to("#u3" + node.id, {r: 15}, "<");
                } else {
                    timeline.to("#u1" + node.id, {r: 20}, "<");
                    timeline.to("#u2" + node.id, {r: 18}, "<");
                    timeline.to("#u3" + node.id, {r: 15}, "<");
                }
            })

            timeline.addLabel(labels[3 * index + 3]);

            intermediateState.incidentEdges.forEach((incidentEdge, index) => {
                if (index == 0) {
                    if (incidentEdge.id === intermediateState.chosenEdge.id) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"});
                        timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                    } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"});
                    } else {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"});
                    }
                } else {
                    if (incidentEdge.id === intermediateState.chosenEdge.id) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                        timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                    } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                    } else {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                    }
                }
            });

            timeline.addLabel(labels[3 * index + 4]);
        });

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
        <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes}/>
            <Nodes nodes={props.output.initialState.nodes} />
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
        <PseudoCodePanel
            lines={PSEUDOCODE_RANDOM}
            activeLineIds={getActiveLineIdsRandom(props.stepIndex, labels.length - 1)}
            title={"Vertex Cover PseudoCode"}
        />
        <ImportExportDialog
            createExportString={props.createExportString}
            onImport={props.onImport}
        />
    </div>;
}