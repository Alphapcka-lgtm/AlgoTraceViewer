import React, {useState} from "react";
import {DynamicNodes} from "../shared/Nodes.tsx";
import type {SVGInputProps, Interaction} from "../shared/Types.tsx";
import {getRandomId} from "../shared/Utils.tsx";
import {IOModeTabs} from "../shared/IOModeTabs.tsx";
import {ImportExportDialog} from "../shared/ImportExportDialog.tsx";

export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({type: "idle"});

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        /*
         * The SVG is responsive: its visual size can differ from the internal viewBox size.
         * Mouse coordinates are measured in screen pixels, so they are
         * convert them back into the SVG coordinate system used by the nodes.
         */
        return {
            x: ((e.clientX - rect.left) / rect.width) * props.width,
            y: ((e.clientY - rect.top) / rect.height) * props.height,
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
        <div className="algorithm-panel">
            <IOModeTabs
                mode="input"
                onChangeInput={props.onChangeInput}
                onSubmit={() => props.onSubmit(props.nodes)}
                canSubmit={props.nodes.length >= 2}
            />

            <svg
                className="algorithm-canvas"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handleNodeMouseUp}
                viewBox={`0 0 ${props.width} ${props.height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <DynamicNodes
                    nodes={props.nodes}
                    onMouseDown={handleNodeMouseDown}
                    onMouseUp={handleNodeMouseUp}
                    onDoubleClick={handleNodeDoubleClick}
                />
            </svg>

            <div className="control-row">
                <button
                    className="control-button"
                    onClick={() => {
                        props.onReset();
                        setInteraction({type: "idle"});
                    }}
                >
                    Reset
                </button>
            </div>

            <ImportExportDialog
                mode="input"
                onImport={props.onImport}
            />
        </div>
    );
}