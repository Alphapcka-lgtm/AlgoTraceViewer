import type { Interaction, SVGInputProps } from "./Types.tsx";

import { getRandomId } from "../shared/Utils.tsx";
import { InputControl } from "./InputControl.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useState, useRef } from "react";
import * as React from "react";


export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });
    const didNodeMove = useRef(false);

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type === "idle") {
            const { x, y } = getMousePos(e);
            props.setInput((prev) => {
                return { ...prev, graph: { ...prev.graph, nodes: [...prev.graph.nodes, { x, y, id: getRandomId() }] }, timestamp: Date.now() };
            });
        } else {
            setInteraction({ type: "idle" });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const pos = getMousePos(e);

        setInteraction((interaction) => {
            if (interaction.type === "dragging"){
                didNodeMove.current = true;
                props.setInput((input) => {
                    return { ...input, graph: { ...input.graph, nodes: input.graph.nodes.map((node) => node.id === interaction.nodeId ? { ...node, ...pos } : node) } , timestamp: Date.now() };
                })
            }
            return interaction;
        });
    };

    const handleNodeMouseDown = (nodeId: string) => {
        if (interaction.type === "idle") {
            didNodeMove.current = false;
            setInteraction({ type: "dragging", nodeId });
        }
    };

    const handleNodeMouseUp = () => {
        if (interaction.type === "dragging") {
            setInteraction({ type: "idle" });
        }
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        props.setInput((input) => {
            return { ...input, graph: { nodes: input.graph.nodes.filter((n) => n.id !== nodeId), edges: input.graph.edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId) }, timestamp: Date.now() };
        })
        setInteraction({ type: "idle" });
    };

    const eventHandler = { onMouseDown: handleNodeMouseDown, onMouseUp: handleNodeMouseUp, onDoubleClick: handleNodeDoubleClick };

    return props.mode === "Output" ? <></> : <>
            <svg height={ props.height } style={ { border: "2px solid black", borderRadius: "30px" } } onClick={ handleCanvasClick } onMouseMove={ handleMouseMove } >
                <Nodes nodes={ props.input.graph.nodes } { ...eventHandler } />
            </svg>
            <InputControl setInput={ props.setInput } input={ props.input } setInteraction={ setInteraction } height={ props.height } width={ 1100 } />
        </>;
}