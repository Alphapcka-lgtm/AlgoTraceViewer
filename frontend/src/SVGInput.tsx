import React, { useState } from "react";
import { DynamicNodes } from "./Nodes";
import type { SVGInputProps, Interaction, Node } from "./Types";
import { getRandomId } from "./Utils";

export function SVGInput(props: SVGInputProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "idle") return;

        const { x, y } = getMousePos(e);
        setNodes((prev) => [...prev, { x, y, id: getRandomId() }]);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "dragging") return;

        const pos = getMousePos(e);

        setNodes((prev) =>
            prev.map((n) =>
                n.id === interaction.nodeId ? { ...n, ...pos } : n
            )
        );
    };

    const handleNodeMouseDown = (nodeId: string) => {
        setInteraction({ type: "dragging", nodeId });
    };

    const handleNodeMouseUp = () => {
        setInteraction({ type: "idle" });
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setInteraction({ type: "idle" });
    };

    return (
        <>
            <svg
                width={props.width}
                height={props.height}
                style={{ border: "1px solid black", borderRadius: "30px" }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleNodeMouseUp}
            >
                <DynamicNodes
                    nodes={nodes}
                    onMouseDown={handleNodeMouseDown}
                    onMouseUp={handleNodeMouseUp}
                    onDoubleClick={handleNodeDoubleClick}
                />
            </svg>

            <div>
                <button
                    style={{ width: "100%" }}
                    onClick={() => {
                        setNodes([]);
                        setInteraction({ type: "idle" });
                    }}
                >
                    reset
                </button>
            </div>
        </>
    );
}