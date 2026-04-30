import type { SVGOutputProps } from "./Types.tsx";

import { OutputControl } from "./OutputControl.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import MorphSVGPlugin from "gsap/MorphSVGPlugin";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import gsap from "gsap";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        tlRef.current = gsap.timeline({
            paused: true,
            onUpdate: () => props.setProgress(tlRef.current.progress()),
            onComplete: () => setIsPlaying(false)
        });

        if (props.mode === "Output") {
            // animation here
            tlRef.current.progress(props.progress);
        }
    }, {dependencies: [props.output.timestamp, props.mode], revertOnUpdate: true});

    const clickEventHandler = { onClick: () => {}, onMouseDown: () => {}, onMouseUp: () => {}, onDoubleClick: () => {} };

    return props.mode === "Input" ? <></> : <>
        <svg height={ props.height } style={ { border: "2px solid black", borderRadius: "30px" } } >
            <Nodes nodes={ props.output.initialState.nodes } { ...clickEventHandler } />
        </svg>
        <OutputControl isPlaying={ isPlaying } setIsPlaying={ setIsPlaying } progress={ props.progress } setProgress={ props.setProgress } tlRef={ tlRef } />
    </>;
}