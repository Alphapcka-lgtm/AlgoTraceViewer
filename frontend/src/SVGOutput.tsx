import gsap from "gsap";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import MorphSVGPlugin from "gsap/MorphSVGPlugin";
import {Edges, NormalizedEdges} from "./Edges.tsx";
import {StaticNodes} from "./Nodes.tsx";

import type {SVGOutputProps} from "./Types.tsx";
import {useGSAP} from "@gsap/react";
import {useRef, useState} from "react";

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const tlRef = useRef<gsap.core.Timeline>(null);

    gsap.registerPlugin(DrawSVGPlugin);
    gsap.registerPlugin(MorphSVGPlugin);

    useGSAP(() => {
        tlRef.current = gsap.timeline({ paused: true } );

        tlRef.current?.from("#i1", {duration: 2, drawSVG: "50% 50%"}, "step0010")

        tlRef.current?.to("#i1", {duration: 1, morphSVG: "#i2"}, "step0011")

        props.output.initialState.edges.forEach((e) => {
            tlRef.current?.to("#d" + e.id, {duration: 1, morphSVG: "#u" + e.id}, "step0012")
        })


    }, [props.output.initialState]);

    return props.mode === "output" ? <>
        <svg height={props.height} style={{ border: "1px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} idPrefix={""} />
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} idPrefix={"d"} />
            <StaticNodes nodes={props.output.initialState.nodes} />
            <NormalizedEdges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} idPrefix={"u"} x={100} y={400} width={800} itemSize={40} />
            <path id="i1" d={getContainerPath(100, 400,800, 0, 20)} style={{stroke: "black", fill: "none"}} />
            <path id="i2" d={getContainerPath(100, 400,800, 40, 20)} style={{display: "none"}} />
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

function getContainerPath(x: number, y: number, w: number, h: number, r: number) : string {
    let z = "";
    z = z + "M " + (x+r) + " " + (y) + " ";
    z = z + "L " + (x+r+w) + " " + (y) + " ";
    z = z + "A " + (r) + " " + (r) + " 0 0 1 " + (x+r+w+r) + " " + (y+r) + " ";
    z = z + "L " + (x+r+w+r) + " " + (y+r+h) + " ";
    z = z + "A " + (r) + " " + (r) + " 0 0 1 " + (x+r+w) + " " + (y+r+h+r) + " ";
    z = z + "L " + (x+r) + " " + (y+r+h+r) + " ";
    z = z + "A " + (r) + " " + (r) + " 0 0 1 " + (x) + " " + (y+r+h) + " ";
    z = z + "L " + (x) + " " + (y+r) + " ";
    z = z + "A " + (r) + " " + (r) + " 0 0 1 " + (x+r) + " " + (y) + " ";
    return z;
}