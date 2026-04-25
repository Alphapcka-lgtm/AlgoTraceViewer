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
    const [currentTime, setCurrentTime] = useState(0);
    const tlRef = useRef<gsap.core.Timeline>(null);

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        const timeline = gsap.timeline({ paused: true } );

        props.output.intermediateStates.forEach((intermediateState) => {
            const randomEdgeLabel = getRandomId();
            const incidentEdgeLabel = getRandomId();
            const tweenVars1 = {filter: "drop-shadow(0px 0px 3px red)", ease: "power4",  duration: 2};
            const tweenVars2 = {filter: "drop-shadow(0px 0px 3px blue)", ease: "power4", duration: 2};
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
        <svg height={props.height} style={{ border: "2px solid black", borderRadius: "30px"}}>
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} idPrefix={""} />
            <StaticNodes nodes={props.output.initialState.nodes} />
        </svg>
        <div style={{display: "flex", flexDirection: "column", gap: 3, padding: 3}}>
            <div style={{display: "flex", gap: 3}}>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current?.pause();
                    tlRef.current?.seek(tlRef.current?.previousLabel(tlRef.current?.time() - 0.01 < 0 ? 0.01 : tlRef.current?.time() - 0.01));
                    setCurrentTime(() => tlRef.current?.time() ? tlRef.current?.time() / tlRef.current?.duration() : 0);
                    setIsPlaying(false);
                }}>Previous Step</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    if (isPlaying) {
                        tlRef.current?.pause();
                        setIsPlaying(false);
                        setCurrentTime(() => tlRef.current?.time() ? tlRef.current?.time() / tlRef.current?.duration() : 0);
                    } else {
                        tlRef.current?.play();
                        setIsPlaying(true);
                    }
                }}>{isPlaying ? "Pause" : "Play"}</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current?.pause();
                    tlRef.current?.seek(tlRef.current?.nextLabel());
                    setCurrentTime(() => tlRef.current?.time() ? tlRef.current?.time() / tlRef.current?.duration() : 0);
                    setIsPlaying(false);
                }}>Next Step</button>
            </div>
            <div style={{display: "flex", gap: 3}}>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current?.pause(0);
                    setIsPlaying(false);
                }}>Reset</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current?.pause(0);
                    setIsPlaying(false);
                    props.onChangeInput()
                }}>Change Input</button>
            </div>
            <input id={"progress"} type={"range"} min={0} max={1} step={0.01} value={currentTime} onInput={(e) => {tlRef.current?.seek(e.currentTarget.valueAsNumber * tlRef.current?.duration() / 100)}}/>
        </div>
    </> : <></>;
}