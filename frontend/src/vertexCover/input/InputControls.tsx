import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import type {InputControlProps, VertexCoverRequest} from "../shared/Types.tsx";
import type {Graph} from "../shared/Types.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";
import type {AnimationRequest} from "../../shared/Types.tsx";
import {getFormattedRequest, getRandomEdges, getRandomGraph} from "../shared/Utils.tsx";
import {ControlsHelp} from "../../shared/ControlsHelpDialog.tsx";

export function InputControls(props: InputControlProps) {

    const setRandomGraph = () => {
        const size = document.getElementById("graphSizeInputSlider") as HTMLInputElement;
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomGraph(size.valueAsNumber, density.valueAsNumber);
        props.setInput((input) => {
            return {
                ...input,
                graph: graph,
                nodeOrder: [],
                edgeOrder: [],
                timestamp: Date.now()
            };
        });
        props.setDensityFactor(density.valueAsNumber);
    };

    const setRandomEdges = () => {
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomEdges(props.input.graph.nodes, density.valueAsNumber);
        props.setInput((input) => {
            return {
                ...input,
                graph: graph,
                edgeOrder: [],
                timestamp: Date.now()
            };
        });
        props.setDensityFactor(density.valueAsNumber);
    };

    const onReset = () => {
        props.setInput({graph: {nodes: [], edges: []}, nodeOrder: [], edgeOrder: [], timestamp: Date.now()});
        props.setInteraction({type: "idle"});
    };

    const setPreset = (request: AnimationRequest) => {
        const myInput = request as VertexCoverRequest;
        props.setInput({...myInput, timestamp: Date.now()});
    }

    return <>
        <div className="control-row">
            <ControlsHelp tab={"input"} algorithm={"vertexCover"}/>


            <PresetSelect setInput={setPreset} algorithm={"vertexCover"} getInput={() => getFormattedRequest(props.input)} />

            <button
                className="control-button"
                onClick={() => {
                    onReset();
                    props.setInteraction({type: "idle"});
                }}
            >
                Reset
            </button>

            <ImportExportDialog
                onImport={props.onImport}
                createExportString={props.createExportString}
            />
        </div>
        <div className="control-row">
            <label className="input-control-slider control-button">
                <span className="input-control-label">Nodes: {props.input.graph.nodes.length}</span>
                <input
                    className="timeline-slider" id={"graphSizeInputSlider"}
                    type="range" min={0} max={40} step={1} value={props.input.graph.nodes.length}
                    onChange={setRandomGraph}
                />
            </label>
            <label className="input-control-slider control-button">
                <span className="input-control-label">Density: {props.densityFactor.toString().slice(0, 4)}</span>
                <input
                    className="timeline-slider" id={"graphDensityInputSlider"}
                    type="range" min={0} max={1} step={"any"} value={props.densityFactor}
                    onChange={setRandomEdges}
                />
            </label>
        </div>
    </>;
}