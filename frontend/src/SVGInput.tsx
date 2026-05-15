import React, {useState} from "react";
import {DynamicNodes} from "./Nodes";
import type {SVGInputProps, Interaction} from "./Types";
import {btnStyle, getRandomId} from "./Utils";

export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({type: "idle"});

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        //if (props.mode !== "input") return;
        if (interaction.type !== "idle") return;

        const {x, y} = getMousePos(e);
        //setNodes((prev) => [...prev, {x, y, id: getRandomId()}]);

        props.onAddNode({x, y, id: getRandomId()});

    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        //if (props.mode !== "input") return;
        if (interaction.type !== "dragging") return;

        const pos = getMousePos(e);
        props.onMoveNode(interaction.nodeId, pos.x, pos.y);

        //setNodes((prev) => prev.map((n) => n.id === interaction.nodeId ? {...n, ...pos} : n));

    };

    const handleNodeMouseDown = (nodeId: string) => {
        //if (props.mode !== "input") return;
        setInteraction({type: "dragging", nodeId});
    };

    const handleNodeMouseUp = () => {
        //if (props.mode !== "input") return;
        setInteraction({type: "idle"});
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        //if (props.mode !== "input") return;

        //setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        props.onDeleteNode(nodeId);
        setInteraction({type: "idle"});
    };

    return (
        <>
            <svg
                width={props.width}
                height={props.height}
                style={{border: "1px solid black", borderRadius: "30px"}}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleNodeMouseUp}
            >
                <DynamicNodes
                    nodes={props.nodes}
                    onMouseDown={handleNodeMouseDown}
                    onMouseUp={handleNodeMouseUp}
                    onDoubleClick={handleNodeDoubleClick}
                />
            </svg>

            <div>
                <button
                    style={btnStyle}
                    onClick={() => {
                        props.onReset();
                        setInteraction({type: "idle"});
                    }}
                >
                    reset
                </button>

                <button
                    style={btnStyle}
                    onClick={() => props.onSubmit(props.nodes)}
                    disabled={props.nodes.length < 2}
                >
                    Submit
                </button>

            </div>
        </>
    );
}