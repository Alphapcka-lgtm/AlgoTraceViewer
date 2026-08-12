import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import type {InputControlProps, VertexCoverRequest} from "../shared/Types.tsx";
import type {Graph} from "../shared/Types.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";
import {useState} from "react";
import type {AnimationRequest} from "../../shared/Types.tsx";
import {getFormattedRequest, getRandomEdges, getRandomGraph} from "../shared/Utils.tsx";

export function InputControls(props: InputControlProps) {
    const [densityFactor, setDensityFactor] = useState<number>(0);

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
        setDensityFactor(density.valueAsNumber);
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
        setDensityFactor(density.valueAsNumber);
    };

    const resetInput = () => {
        props.setInput({graph: {nodes: [], edges: []}, nodeOrder: [], edgeOrder: [], timestamp: Date.now()});
        props.setInteraction({type: "idle"});
    };

    const setPreset = (request: AnimationRequest) => {
        const myInput = request as VertexCoverRequest;
        props.setInput({...myInput, timestamp: Date.now()});
    }

    return <>
        <div className="control-row">
            <ImportExportDialog
                createExportString={props.createExportString}
                onImport={props.onImport}
            />
            <button onClick={resetInput} className="control-button vertex-cover-reset-button">Reset</button>
        </div>
        <div className="control-row">
            <PresetSelect setInput={setPreset} algorithm={"vertexCover"} getInput={() => getFormattedRequest(props.input)} />
            <div className="control-button">
                <label htmlFor={"graphSizeInputSlider"}>Number of Nodes: {props.input.graph.nodes.length}</label>
                <input id={"graphSizeInputSlider"} type={"range"} min={0} max={50} step={1}
                       value={props.input.graph.nodes.length} onInput={setRandomGraph} className="vertex-cover-range-input"/>
            </div>
            <div className="control-button">
                <label htmlFor={"graphDensityInputSlider"}>Density
                    Factor: {densityFactor.toString().slice(0, 4)}</label>
                <input id={"graphDensityInputSlider"} type={"range"} min={0} max={1} step={"any"}
                       value={densityFactor} onInput={setRandomEdges} className="vertex-cover-range-input"/>
            </div>
        </div>
    </>;
}