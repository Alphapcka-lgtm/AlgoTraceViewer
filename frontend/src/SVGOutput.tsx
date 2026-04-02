import gsap from "gsap";
import {Edges} from "./Edges.tsx";
import {StaticNodes} from "./Nodes.tsx";

import type {SVGOutputProps} from "./Types.tsx";
import {useGSAP} from "@gsap/react";
import {useRef, useState} from "react";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const tlRef = useRef<gsap.core.Timeline>(null);

    useGSAP(() => {
        tlRef.current = gsap.timeline({ paused: true });

        props.output.initialState.nodes.forEach(node => {
            const el = document.getElementById(node.id);
            if(el) {
                const x = 200 * (Math.random() - 0.5);
                const y = 200 * (Math.random() - 0.5);
                tlRef.current?.to(el, {x, y, duration: 4, repeat: -1, yoyo: true}, "test")
            }
        });

    }, [props.output.initialState]);

    return props.mode === "output" ? <>
        <svg height={props.height} style={{ border: "1px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} />
            <StaticNodes nodes={props.output.initialState.nodes} />
        </svg>
        <div>
            <button style={{width: "50%"}} onClick={() => {
                if (isPlaying) {
                    tlRef.current?.pause();
                    setIsPlaying(false);
                } else {
                    tlRef.current?.play();
                    setIsPlaying(true);
                }
            }}>{isPlaying ? "Pause" : "Play"}</button>

            <button style={{width: "50%"}} onClick={() => {
                tlRef.current?.pause(0);
                setIsPlaying(false);
            }}>Reset</button>
        </div>
        <button onClick={() => {
            tlRef.current?.pause(0);
            setIsPlaying(false);
            props.onChangeInput()
        }}>Change Input</button>
    </> : <></>;
}