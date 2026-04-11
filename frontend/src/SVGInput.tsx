import React, { useState } from "react";
import { DynamicNodes, StaticNodes } from "./Nodes";
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
        if (props.mode !== "input") return;
        if (interaction.type !== "idle") return;

        const { x, y } = getMousePos(e);
        setNodes((prev) => [...prev, { x, y, id: getRandomId() }]);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (props.mode !== "input") return;
        if (interaction.type !== "dragging") return;

        const pos = getMousePos(e);

        setNodes((prev) =>
            prev.map((n) =>
                n.id === interaction.nodeId ? { ...n, ...pos } : n
            )
        );
    };

    const handleNodeMouseDown = (nodeId: string) => {
        if (props.mode !== "input") return;
        setInteraction({ type: "dragging", nodeId });
    };

    const handleNodeMouseUp = () => {
        if (props.mode !== "input") return;
        setInteraction({ type: "idle" });
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        if (props.mode !== "input") return;

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
                {props.mode === "input" ? (

                    <DynamicNodes //DynamicNodes, reset-Button, Submit-Button, verändern erlubt
                        nodes={nodes}
                        onMouseDown={handleNodeMouseDown}
                        onMouseUp={handleNodeMouseUp}
                        onDoubleClick={handleNodeDoubleClick}
                    />
                ) : (
                    <StaticNodes nodes={nodes} /> //static nodes, change input button, man kann nichts mehr bearbeiten
                )}
            </svg>

            {props.mode === "input" ? (
                <>
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

                    <div>
                        <button
                            style={{ width: "100%" }}
                            onClick={() => props.onSubmit(nodes)}
                        >
                            Submit
                        </button>
                    </div>
                </>
            ) : (
                <div>
                    <button
                        style={{ width: "100%" }}
                        onClick={props.onChangeInput}
                    >
                        Change Input
                    </button>
                </div>
            )}
        </>
    );
}