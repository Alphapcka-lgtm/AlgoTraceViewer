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
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [currentProgress, setCurrentProgress] = useState<number>(0);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        const timeline = gsap.timeline({ paused: true, onUpdate: () => setCurrentProgress(tlRef.current.progress()), onComplete: () => setIsPlaying(false)});

        props.output.intermediateStates.forEach((intermediateState) => {
            const pickRandomEdge = getRandomId();
            const markIncidentEdges = getRandomId();
            const tweenVars1 = {filter: "drop-shadow(0px 0px 3px red)", ease: "power4",  duration: 2};
            const tweenVars2 = {filter: "drop-shadow(0px 0px 3px blue)", ease: "power4", duration: 2};
            timeline.to("#" + intermediateState.chosenEdge.id, tweenVars1, pickRandomEdge);
            timeline.to("#" + intermediateState.chosenEdge.fromId, tweenVars1, pickRandomEdge);
            timeline.to("#" + intermediateState.chosenEdge.toId, tweenVars1, pickRandomEdge);

            intermediateState.incidentEdges.forEach((incidentEdge) => {
                timeline.to("#" + incidentEdge.id, tweenVars2, markIncidentEdges);
            });
        })

        setCurrentProgress(0);
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
                    tlRef.current.pause();
                    setIsPlaying(false);
                    tlRef.current.seek(tlRef.current.previousLabel(tlRef.current.time() - 0.01 < 0 ? 0.01 : tlRef.current.time() - 0.01));
                    setCurrentProgress(tlRef.current.progress());
                }}>Previous Step</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    if(isPlaying){
                        tlRef.current.pause();
                        setIsPlaying(false);
                        setCurrentProgress(tlRef.current.progress());
                    }else{
                        if(currentProgress == 1){
                            tlRef.current.play(0);
                        } else {
                            tlRef.current.play();
                        }
                        setIsPlaying(true);
                    }
                }}>{isPlaying ? "Pause" : "Play"}</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current.pause();
                    setIsPlaying(false);
                    tlRef.current.seek(tlRef.current.nextLabel());
                    setCurrentProgress(tlRef.current.progress());
                }}>Next Step</button>
            </div>
            <div style={{display: "flex", gap: 3}}>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current.pause(0);
                    setCurrentProgress(0);
                    setIsPlaying(false);
                }}>Reset</button>
                <button style={{flex: 1, border: "2px solid black", borderRadius: "30px"}} onClick={() => {
                    tlRef.current.pause(0);
                    setIsPlaying(false);
                    props.onChangeInput();
                }}>Change Input</button>
            </div>
            <input id={"progress"} type={"range"} min={0} max={1} step={"any"} value={currentProgress} onInput={(e) => {
                tlRef.current.progress(e.currentTarget.valueAsNumber);
            }}/>
        </div>
    </> : <></>;
}