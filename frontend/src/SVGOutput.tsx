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
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        tlRef.current = gsap.timeline({
            paused: true,
            onUpdate: () => props.setCurrentProgress(tlRef.current.progress()),
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
            tlRef.current.progress(props.currentProgress);
        }
    }, {dependencies: [props.output.timestamp, props.mode], revertOnUpdate: true});

    const jumpToPreviousStep = () => {
        if (isPlaying){
            stopAnimation();
        }
        tlRef.current.seek(tlRef.current.previousLabel(tlRef.current.time() - 0.01 < 0 ? 0.01 : tlRef.current.time() - 0.01));
        props.setCurrentProgress(tlRef.current.progress());
    }

    const stopAnimation = () => {
        tlRef.current.pause();
        setIsPlaying(false);
    }

    const startAnimation = () => {
        if (props.currentProgress === 1){
            tlRef.current.play(0);
        } else {
            tlRef.current.play();
        }
        setIsPlaying(true);
    }

    const jumpToNextStep = () => {
        if (isPlaying){
            stopAnimation();
        }
        tlRef.current.seek(tlRef.current.nextLabel());
        props.setCurrentProgress(tlRef.current.progress());
    }

    const resetAnimation = () => {
        if (isPlaying){
            setIsPlaying(false);
        }
        tlRef.current.pause(0);
        props.setCurrentProgress(0);
    }

    return props.mode === "Input" ? <></> : <>
        <svg height={ props.height } style={ { border: "2px solid black", borderRadius: "30px" } } >
            <Edges edges={ props.output.initialState.edges } nodes={ props.output.initialState.nodes } idPrefix={ "" } />
            <StaticNodes nodes={ props.output.initialState.nodes } idPrefix={ "" } />
        </svg>
        <div style={ { display: "flex", flexDirection: "column", gap: 3 } } >
            <div style={ { display: "flex", gap: 3 } } >
                <button onClick={ () => jumpToPreviousStep() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Previous Step</button>
                <button onClick={ () => isPlaying ? stopAnimation() : startAnimation() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >{isPlaying ? "Pause" : "Play"}</button>
                <button onClick={ () => jumpToNextStep() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Next Step</button>
            </div>
            <button onClick={ () => resetAnimation() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Reset</button>
            <input type={ "range" } min={ 0 } max={ 1 } step={ "any" } value={ props.currentProgress } onInput={ (e) => tlRef.current.progress(e.currentTarget.valueAsNumber) } />
        </div>
    </>;
}