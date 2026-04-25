import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import MorphSVGPlugin from "gsap/MorphSVGPlugin";
import {Edges} from "./Edges.tsx";
import {StaticNodes} from "./Nodes.tsx";

import type {SVGOutputProps} from "./Types.tsx";
import {useGSAP} from "@gsap/react";
import {useRef, useState} from "react";
import {getRandomId} from "./Utils.tsx";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const tlRef = useRef<gsap.core.Timeline>(null);

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        const timeline = gsap.timeline({ paused: true } );

        props.output.intermediateStates.forEach((intermediateState) => {
            const randomEdgeLabel = getRandomId();
            const incidentEdgeLabel = getRandomId();
            const tweenVars1 = {filter: "drop-shadow(0px 0px 3px red)", duration: 1};
            const tweenVars2 = {filter: "drop-shadow(0px 0px 3px blue)", duration: 1};
            timeline.to("#" + intermediateState.chosenEdge.id, tweenVars1, randomEdgeLabel);
            timeline.to("#" + intermediateState.chosenEdge.fromId, tweenVars1, randomEdgeLabel);
            timeline.to("#" + intermediateState.chosenEdge.toId, tweenVars1, randomEdgeLabel);

            intermediateState.incidentEdges.forEach((incidentEdge) => {
                timeline.to("#" + incidentEdge.id, tweenVars2, incidentEdgeLabel);
            });
        })

        tlRef.current = timeline;

    }, [props.output.initialState]);

    return props.mode === "output" ? <>
        <svg height={props.height} style={{ border: "2px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} idPrefix={""} />
            <StaticNodes nodes={props.output.initialState.nodes} />
        </svg>
        <div style={{display: "flex"}}>
            <button style={{flex: 1}} onClick={() => {
                if (isPlaying) {
                    tlRef.current?.pause();
                    setIsPlaying(false);
                } else {
                    tlRef.current?.play();
                    setIsPlaying(true);
                }
            }}>{isPlaying ? "Pause" : "Play"}</button>
            <button style={{flex: 1}} onClick={() => {
                tlRef.current?.pause(0);
                setIsPlaying(false);
            }}>Reset</button>
        </div>
        <div style={{display: "flex"}}>
            <button style={{flex: 1}} onClick={() => {
                tlRef.current?.seek(tlRef.current?.previousLabel(tlRef.current?.time() - 0.01 < 0 ? 0.01 : tlRef.current?.time() - 0.01))}
            }>&lt;</button>
            <button style={{flex: 1}} onClick={() => {
                tlRef.current?.seek(tlRef.current?.nextLabel())}
            }>&gt;</button>
        </div>
        <button onClick={() => {
            tlRef.current?.pause(0);
            setIsPlaying(false);
            props.onChangeInput()
        }}>Change Input</button>
    </> : <></>;
}