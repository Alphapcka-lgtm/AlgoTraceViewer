import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {getRandomId} from "../../shared/Utils.tsx";
import type {InputControlProps, VertexCoverRequest} from "../shared/Types.tsx";
import type {Graph} from "../shared/Types.tsx";
import {PresetSelect} from "../../shared/PresetSelect.tsx";
import {useState} from "react";
import type {AnimationRequest} from "../../shared/Types.tsx";

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

    const resetInput = () => {
        props.setInput((input) => {
            return {...input, graph: {nodes: [], edges: []}, timestamp: Date.now()};
        });
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
            <button onClick={resetInput} className="control-button" style={{flex: 13}}>Reset</button>
        </div>
        <div className="control-row">
            <PresetSelect input={props.input} setInput={setPreset} algorithm={"vertexCover"} />
            <div className="control-button">
                <label htmlFor={"graphSizeInputSlider"}>Number of Nodes: {props.input.graph.nodes.length}</label>
                <input id={"graphSizeInputSlider"} type={"range"} min={0} max={50} step={1}
                       value={props.input.graph.nodes.length} onInput={setRandomGraph} style={{width: "100%"}}/>
            </div>
            <div className="control-button">
                <label htmlFor={"graphDensityInputSlider"}>Density
                    Factor: {densityFactor.toString().slice(0, 4)}</label>
                <input id={"graphDensityInputSlider"} type={"range"} min={0} max={1} step={"any"}
                       value={densityFactor} onInput={setRandomGraph} style={{width: "100%"}}/>
            </div>
        </div>
    </>;
}

function getRandomGraph(n: number, d: number): Graph {
    const graph: Graph = {nodes: [], edges: []};

    for (let i = 0; i < n; i++) {
        const xCoordinate = ((Math.cos((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        const yCoordinate = ((Math.sin((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        graph.nodes.push({
            x: Math.floor(xCoordinate * 1123),
            y: Math.floor(yCoordinate * 500),
            id: getRandomId(),
            label: ""
        })
    }

    for (let i = 0; i < graph.nodes.length; i++) {
        for (let j = i + 1; j < graph.nodes.length; j++) {
            if (Math.random() < d) {
                graph.edges.push({fromId: graph.nodes[i].id, toId: graph.nodes[j].id, id: getRandomId()});
            }
        }
    }
    return graph;
}