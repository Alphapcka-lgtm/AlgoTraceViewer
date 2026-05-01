import type { SVGOutputProps } from "./Types.tsx";

import { OutputControl } from "./OutputControl.tsx";
import { getRandomId } from "../shared/Utils.tsx";
import { Edges } from "../shared/Edges.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import gsap from "gsap";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());

    useGSAP(() => {
        tlRef.current = gsap.timeline({
            paused: true,
            onUpdate: () => props.setProgress(tlRef.current.progress()),
            onComplete: () => setIsPlaying(false)
        });

        if (props.mode === "Output") {
            props.output.intermediateStates.forEach((intermediateState) => {
                const pickRandomEdge = getRandomId();
                const markIncidentEdges = getRandomId();
                const tweenVars1 = {filter: "drop-shadow(0px 0px 5px red)", ease: "power4",  duration: 0.1};
                const tweenVars2 = {filter: "drop-shadow(0px 0px 3px blue)", ease: "power4", duration: 0.1};

                tlRef.current.to("#" + intermediateState.chosenEdge.id, tweenVars1, pickRandomEdge);
                tlRef.current.to("#" + intermediateState.chosenEdge.fromId, tweenVars1, pickRandomEdge);
                tlRef.current.to("#" + intermediateState.chosenEdge.toId, tweenVars1, pickRandomEdge);

                intermediateState.incidentEdges.forEach((incidentEdge) => {
                    tlRef.current.to("#" + incidentEdge.id, tweenVars2, markIncidentEdges);
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
        <OutputControl isPlaying={ isPlaying } setIsPlaying={ setIsPlaying } progress={ props.progress } setProgress={ props.setProgress } tlRef={ tlRef } />
    </>;
}