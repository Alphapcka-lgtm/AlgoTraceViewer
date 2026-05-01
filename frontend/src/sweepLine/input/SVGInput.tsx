import type { Interaction, SVGInputProps } from "./Types.tsx";

import { getRandomId } from "../shared/Utils.tsx";
import { InputControl } from "./InputControl.tsx";
import { Nodes } from "../shared/Nodes.tsx";
import { useState, useRef } from "react";
import * as React from "react";


export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });
    const didNodeMove = useRef(false);

    const getRelativeCoordinates = (e: React.MouseEvent<SVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: 1920 * (e.clientX - rect.left) / (rect.width), y: 1080 * (e.clientY - rect.top)  / (rect.height) };

    }

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type === "idle") {
            const { x, y } = getRelativeCoordinates(e);
            props.setInput((prev) => {
                return { ...prev, graph: { ...prev.graph, nodes: [...prev.graph.nodes, { x, y, id: getRandomId() }] }, timestamp: Date.now() };
            });
        } else {
            setInteraction({ type: "idle" });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const pos = getRelativeCoordinates(e);

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
            return { ...input, graph: { nodes: input.graph.nodes.filter((n) => n.id !== nodeId) }, timestamp: Date.now() };
        })
        setInteraction({ type: "idle" });
    };

    const eventHandler = { onMouseDown: handleNodeMouseDown, onMouseUp: handleNodeMouseUp, onDoubleClick: handleNodeDoubleClick };

    return props.mode === "Output" ? <></> : <>
            <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet" style={ { flex: 1, width: "100%", border: "2px solid black", borderRadius: "30px" } } onClick={ handleCanvasClick } onMouseMove={ handleMouseMove } >
                <Nodes nodes={ props.input.graph.nodes } { ...eventHandler } />
            </svg>
            <InputControl setInput={ props.setInput } input={ props.input } setInteraction={ setInteraction } />
        </>;
}