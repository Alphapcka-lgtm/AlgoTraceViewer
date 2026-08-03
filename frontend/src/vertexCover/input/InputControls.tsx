import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {getRandomId} from "../../shared/Utils.tsx";
import type {InputControlProps} from "../shared/Types.tsx";
import type {Graph} from "../shared/Types.tsx";
import {presets} from "./Presets.tsx";

export function InputControls(props: InputControlProps) {

    const setRandomGraph = () => {
        const size = document.getElementById("graphSizeInputSlider") as HTMLInputElement;
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomGraph(size.valueAsNumber, density.valueAsNumber);
        props.setInput((input) => {
            return {
                ...input,
                densityFactor: density.valueAsNumber,
                graph: graph,
                preset: "random",
                timestamp: Date.now()
            };
        });
    };

    const resetInput = () => {
        props.setInput((input) => {
            return {...input, graph: {nodes: [], edges: []}, preset: "custom", timestamp: Date.now()};
        });
        props.setInteraction({type: "idle"});
    };

    return <>
        <div className="control-row">
            <ImportExportDialog
                createExportString={props.createExportString}
                onImport={props.onImport}
            />
            <button onClick={resetInput} className="control-button" style={{flex: 13}}>Reset</button>
        </div>
        <div className="control-row">
            <select
                className="control-select"
                style={{flex: 1}}
                value={props.input.preset}
                onChange={(e) => {
                    const selected = e.target.value;
                    if (selected === "random") {
                        setRandomGraph();
                    } else if (selected !== "custom") {
                        const importString = presets.filter(preset => preset.name === selected)[0].importString;
                        props.onImport(importString);
                    }
                }}
            >
                {presets.map((preset, index) => <option key={index} value={preset.name}>{preset.name}</option>)}
                <option value="random">random</option>
                <option value="custom">custom</option>
            </select>
            <div className="control-button">
                <label htmlFor={"graphSizeInputSlider"}>Number of Nodes: {props.input.graph.nodes.length}</label>
                <input id={"graphSizeInputSlider"} type={"range"} min={0} max={50} step={1}
                       value={props.input.graph.nodes.length} onInput={setRandomGraph} style={{width: "100%"}}/>
            </div>
            <div className="control-button">
                <label htmlFor={"graphDensityInputSlider"}>Density
                    Factor: {props.input.densityFactor.toString().slice(0, 4)}</label>
                <input id={"graphDensityInputSlider"} type={"range"} min={0} max={1} step={"any"}
                       value={props.input.densityFactor} onInput={setRandomGraph} style={{width: "100%"}}/>
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