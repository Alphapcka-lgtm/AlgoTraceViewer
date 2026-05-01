import type { SVGOutputProps } from "./Types.tsx";

import { OutputControl } from "./OutputControl.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import MorphSVGPlugin from "gsap/MorphSVGPlugin";
import gsap from "gsap";
import {SweepingBoxes} from "../shared/SweepingBoxes.tsx";
import {getRandomId} from "../shared/Utils.tsx";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());

    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {

        MorphSVGPlugin.convertToPath(".sweepingBox");

        tlRef.current = gsap.timeline({
            paused: true,
            onUpdate: () => props.setProgress(tlRef.current.progress()),
            onComplete: () => setIsPlaying(false)
        });


        if (props.mode === "Output") {

            props.output.intermediateStates.forEach((intermediateState, index) => {
                if(index > 0) {
                    tlRef.current.to("#a" + props.output.intermediateStates[0].currentNode.id, {duration: 1, morphSVG: "#a" + intermediateState.currentNode.id}, getRandomId());
                    tlRef.current.to("#a" + props.output.intermediateStates[0].currentNode.id, {duration: 1, morphSVG: "#b" + intermediateState.currentNode.id}, getRandomId());
                }
            })
            tlRef.current.progress(props.progress);
        }
    }, {dependencies: [props.output.timestamp, props.mode], revertOnUpdate: true});

    const clickEventHandler = { onClick: () => {}, onMouseDown: () => {}, onMouseUp: () => {}, onDoubleClick: () => {} };

    return props.mode === "Input" ? <></> : <>
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={ { flex: 1, width: "100%", border: "2px solid black", borderRadius: "30px" } } >
            <SweepingBoxes animationSteps={ props.output.intermediateStates } />
            <Nodes nodes={ props.output.initialState.nodes } { ...clickEventHandler } />
        </svg>
        <OutputControl isPlaying={ isPlaying } setIsPlaying={ setIsPlaying } progress={ props.progress } setProgress={ props.setProgress } tlRef={ tlRef } />
    </>;
}