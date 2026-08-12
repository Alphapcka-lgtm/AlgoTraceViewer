import React, {useState} from "react";
import {DynamicPoints} from "../shared/Points.tsx";
import type {InputProps, Interaction} from "../shared/Types.tsx";
import {getRandomId, SVG_HEIGHT, SVG_WIDTH} from "../../shared/Utils.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {ControlsHelp} from "../../shared/ControlsHelpDialog.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";

export function Input(props: InputProps) {
    const [interaction, setInteraction] = useState<Interaction>({type: "idle"});
    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        /*
         * The SVG is responsive: its visual size can differ from the internal viewBox size.
         * Mouse coordinates are measured in screen pixels, so they are
         * convert them back into the SVG coordinate system used by the points.
         */
        return {
            x: ((e.clientX - rect.left) / rect.width) * SVG_WIDTH,
            y: ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT,
        };
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "idle") return;
        const {x, y} = getMousePos(e);
        props.onAddPoint({x: Math.round(x), y: Math.round(y), id: getRandomId(), label: ""});

    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "dragging") return;
        const pos = getMousePos(e);
        props.onMovePoint(interaction.pointId, pos.x, pos.y);
    };

    const handlePointMouseDown = (pointId: string) => {
        setInteraction({type: "dragging", pointId});
    };

    const handlePointMouseUp = () => {
        setInteraction({type: "idle"});
    };

    const handlePointDoubleClick = (pointId: string) => {
        props.onDeletePoint(pointId);
        setInteraction({type: "idle"});
    };

    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="input"
                onChangeInput={props.onChangeInput}
                onSubmit={props.onSubmit}
                canSubmit={props.inputState.points.length >= 2}
            />

            <svg
                className="algorithm-canvas"
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
                onMouseUp={handlePointMouseUp}
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <DynamicPoints
                    points={props.inputState.points}
                    onMouseDown={handlePointMouseDown}
                    onMouseUp={handlePointMouseUp}
                    onDoubleClick={handlePointDoubleClick}
                />
            </svg>

            <div className="control-row">
                <ControlsHelp tab={"input"} algorithm={"closestPair"}/>

                <PresetSelect algorithm={"closestPair"} setInput={props.onPresetChange} getInput={() => props.inputState}/>

                <button
                    className="control-button"
                    onClick={() => {
                        props.onReset();
                        setInteraction({type: "idle"});
                    }}
                >
                    Reset
                </button>

                <ImportExportDialog
                    onImport={props.onImport}
                    createExportString={props.createExportString}
                />

                <label className="closest-pair-point-count-control">
                <span className="closest-pair-point-count-label">Points: {props.inputState.points.length}</span>
                    <input
                        className="timeline-slider"
                        type="range" min={0} max={50} value={props.inputState.points.length}
                        onChange={(event) =>
                            props.onSetPointCount(Number(event.currentTarget.value))
                        }
                    />
                </label>
            </div>
        </div>
    );
}
