import type { SVGOutputProps } from "./Types.tsx";

import { OutputControl } from "./OutputControl.tsx";
import { createStepLabels, getStepIndexFromTimeline } from "../shared/Utils.tsx";
import { Edges } from "../shared/Edges.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";

const STEP_DURATION = 1.0;

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const labels = createStepLabels(2 * props.output.intermediateStates.length + 1);

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

                const stepIndex:number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });


        if (props.mode === "Output") {

            timeline.addLabel(labels[0]);


            props.output.intermediateStates.forEach((intermediateState, index) => {

                timeline.set("#u1" + intermediateState.chosenEdge.id, {opacity: 100});
                timeline.from("#u1" + intermediateState.chosenEdge.id, {drawSVG: "50% 50%"}, "<");
                timeline.to("#u1" + intermediateState.chosenEdge.fromId, {r: 29}, "<");
                timeline.to("#u1" + intermediateState.chosenEdge.toId, {r: 29}, "<");
                timeline.to("#u2" + intermediateState.chosenEdge.fromId, {r: 26}, "<");
                timeline.to("#u2" + intermediateState.chosenEdge.toId, {r: 26}, "<");
                timeline.to("#u3" + intermediateState.chosenEdge.fromId, {r: 20}, "<");
                timeline.to("#u3" + intermediateState.chosenEdge.toId, {r: 20}, "<");

                timeline.addLabel(labels[2 * index + 1]);

                intermediateState.incidentEdges.forEach((incidentEdge, index) => {
                    if(index == 0){
                        if (incidentEdge.id === intermediateState.chosenEdge.id) {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100});
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                            timeline.set("#u3" + incidentEdge.id, {opacity: 100}, "<");
                            timeline.from("#u3" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                        } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100});
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                        } else {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100});
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                        }
                    } else {
                        if (incidentEdge.id === intermediateState.chosenEdge.id) {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100}, "<");
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                            timeline.set("#u3" + incidentEdge.id, {opacity: 100}, "<");
                            timeline.from("#u3" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                        } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100}, "<");
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                        } else {
                            timeline.set("#u2" + incidentEdge.id, {opacity: 100}, "<");
                            timeline.from("#u2" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                        }
                    }
                });

                timeline.addLabel(labels[2 * index + 2]);
            });

            timeline.progress(props.progress).pause();
            setIsPlaying(false);
            tlRef.current = timeline;

            return () => {
                timeline.kill();
                tlRef.current = gsap.timeline({paused: true});
            };
        }
    }, {dependencies: [props.output.timestamp, props.mode], revertOnUpdate: true});

    const clickEventHandler = { onClick: () => {}, onMouseDown: () => {}, onMouseUp: () => {}, onDoubleClick: () => {} };

    return props.mode === "Input" ? <></> : <>
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={ { flex: 1, width: "100%", border: "2px solid black", borderRadius: "30px" } } >
            <Edges edges={ props.output.initialState.edges } nodes={ props.output.initialState.nodes } />
            <Nodes nodes={ props.output.initialState.nodes } { ...clickEventHandler } />
        </svg>
        <div><strong>Step:</strong> {props.stepIndex} / {labels.length-1}</div>
        <OutputControl isPlaying={ isPlaying } setIsPlaying={ setIsPlaying } progress={ props.progress } setProgress={ props.setProgress } tlRef={ tlRef } setStepIndex={ props.setStepIndex } stepIndex={ props.stepIndex } labels={ labels } />
    </>;
}