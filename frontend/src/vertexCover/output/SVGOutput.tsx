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
    const labels = createStepLabels(props.output.intermediateStates.length);

    useGSAP(() => {
        let lastLabel: string | null = null;

        tlRef.current = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = tlRef.current;
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex:number = getStepIndexFromTimeline(tl, labels);

                const currentLabel: string = stepIndex.toString();
                if(currentLabel === lastLabel){ // nur wenn sich label ändert currentStep updaten und somit auch nur dann rerendern
                    return;
                }

                lastLabel = currentLabel;

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        if (props.mode === "Output") {
            props.output.intermediateStates.forEach((intermediateState, index) => {
                const markRandomEdge = {filter: "drop-shadow(0px 0px 5px red)"};

                tlRef.current.to("#" + intermediateState.chosenEdge.id, markRandomEdge, labels[index]);
                tlRef.current.to("#" + intermediateState.chosenEdge.fromId, markRandomEdge, labels[index]);
                tlRef.current.to("#" + intermediateState.chosenEdge.toId, markRandomEdge, labels[index]);

                const markIncidentEdges = {filter: "drop-shadow(0px 0px 3px blue)"};

                intermediateState.incidentEdges.forEach((incidentEdge) => {
                    tlRef.current.to("#" + incidentEdge.id, markIncidentEdges, labels[index]);
                });
            });
            tlRef.current.progress(props.progress);
        }
    }, {dependencies: [props.output.timestamp, props.mode], revertOnUpdate: true});

    const clickEventHandler = { onClick: () => {}, onMouseDown: () => {}, onMouseUp: () => {}, onDoubleClick: () => {} };

    return props.mode === "Input" ? <></> : <>
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={ { flex: 1, width: "100%", border: "2px solid black", borderRadius: "30px" } } >
            <Edges edges={ props.output.initialState.edges } nodes={ props.output.initialState.nodes } />
            <Nodes nodes={ props.output.initialState.nodes } { ...clickEventHandler } />
        </svg>
        <div><strong>Step:</strong> {props.stepIndex} / {labels.length}</div>
        <OutputControl isPlaying={ isPlaying } setIsPlaying={ setIsPlaying } progress={ props.progress } setProgress={ props.setProgress } tlRef={ tlRef } setStepIndex={ props.setStepIndex } stepIndex={ props.stepIndex } labels={ labels } />
    </>;
}