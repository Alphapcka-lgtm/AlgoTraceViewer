import gsap from "gsap";
import {Edges} from "./Edges.tsx";
import {StaticNodes} from "./Nodes.tsx";

import type {Node, Edge, SVGOutputProps} from "./Types.tsx";
import {useGSAP} from "@gsap/react";
import {useRef, useState} from "react";

type NodeTranslation = {node: Node, x: number, y: number};
type EdgeTranslation = {edge: Edge, x1: number, x2: number, y1: number, y2: number};

export function SVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const tlRef = useRef<gsap.core.Timeline>(null);

    const getEdgeTranslations = (edges: Edge[], nodeTranslations: NodeTranslation[]) => edges.map(edge => {
        const firstNodeTranslation: NodeTranslation = nodeTranslations.find(nt => nt.node.id === edge.fromId)!;
        const secondNodeTranslation: NodeTranslation = nodeTranslations.find(nt => nt.node.id === edge.toId)!;

        return {
            edge: edge,
            x1: firstNodeTranslation ? firstNodeTranslation.x : 0,
            y1: firstNodeTranslation ? firstNodeTranslation.y : 0,
            x2: secondNodeTranslation ? secondNodeTranslation.x : 0,
            y2: secondNodeTranslation ? secondNodeTranslation.y : 0
        };

    });

    useGSAP(() => {
        tlRef.current = gsap.timeline({ paused: true });

        const nodeTranslations: NodeTranslation[] = props.output.initialState.nodes.map(node => {return {node: node, x: 20, y: 20};});
        const edgeTranslations : EdgeTranslation[] = getEdgeTranslations(props.output.initialState.edges, nodeTranslations);

        nodeTranslations.forEach(translation => {
            const el = document.getElementById(translation.node.id);
            if(el) {tlRef.current?.to(el, {x: translation.x, y: translation.y, duration: 2, repeat: -1, yoyo: true}, "test")}
        });

        edgeTranslations.forEach(translation => {
            const el = document.getElementById(translation.edge.id);
            if(el) {tlRef.current?.to(el, {x: 10, y: 10, x2: translation.x2, y2: translation.y2, duration: 2, repeat: -1, yoyo: true}, "test")}
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