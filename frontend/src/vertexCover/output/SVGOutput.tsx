import type { SVGOutputProps } from "./Types.tsx";

import { OutputControl } from "./OutputControl.tsx";
import { createStepLabels, getStepIndexFromTimeline } from "../shared/Utils.tsx";
import { Edges } from "../shared/Edges.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";

const STEP_DURATION = 1.0;

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const labels = createStepLabels(2 * props.output.intermediateStates.length + 1);

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

                const stepIndex:number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        timeline.addLabel(labels[0]);

        if (props.mode === "Output") {
            props.output.intermediateStates.forEach((intermediateState, index) => {
                const markRandomEdge = {filter: "drop-shadow(0px 0px 5px red)"};

                timeline.to("#" + intermediateState.chosenEdge.id, markRandomEdge);
                timeline.to("#" + intermediateState.chosenEdge.fromId, markRandomEdge, "<");
                timeline.to("#" + intermediateState.chosenEdge.toId, markRandomEdge, "<");

                timeline.addLabel(labels[2 * index + 1]);

                const markIncidentEdges = {filter: "drop-shadow(0px 0px 3px blue)"};

                intermediateState.incidentEdges.forEach((incidentEdge, index) => {
                    if(index == 0){
                        timeline.to("#" + incidentEdge.id, markIncidentEdges);
                    } else {
                        timeline.to("#" + incidentEdge.id, markIncidentEdges, "<");
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