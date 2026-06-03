import React, {useState} from "react";
import {DynamicNodes} from "../shared/Nodes.tsx";
import type {SVGInputProps, Interaction} from "../shared/Types.tsx";
import {btnStyle, getRandomId} from "../shared/Utils.tsx";
import {IOModeTabs} from "../shared/IOModeTabs.tsx";
import {ImportExportDialog} from "../shared/ImportExportDialog.tsx";

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
        if (interaction.type !== "idle") return;
        const {x, y} = getMousePos(e);
        props.onAddNode({x, y, id: getRandomId()});

    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "dragging") return;
        const pos = getMousePos(e);
        props.onMoveNode(interaction.nodeId, pos.x, pos.y);
    };

    const handleNodeMouseDown = (nodeId: string) => {
        setInteraction({type: "dragging", nodeId});
    };

    const handleNodeMouseUp = () => {
        setInteraction({type: "idle"});
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        props.onDeleteNode(nodeId);
        setInteraction({type: "idle"});
    };

    return (
        <>
            <IOModeTabs
                mode="input"
                onChangeInput={props.onChangeInput}
                onSubmit={() => props.onSubmit(props.nodes)}
                canSubmit={props.nodes.length >= 2}
            />

            <svg
                width={props.width}
                height={props.height}
                style={{border: "2px solid black", borderRadius: "15px"}}
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
            </div>

            <ImportExportDialog
                mode={"input"}
                onImport={props.onImport}
            />
        </>
    );
}