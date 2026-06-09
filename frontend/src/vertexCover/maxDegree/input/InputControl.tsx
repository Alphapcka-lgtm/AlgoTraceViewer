import type {InputControlProps} from "./Types.tsx";
import type {Graph} from "../shared/Types.tsx";

import {getRandomId} from "../shared/Utils.tsx";
import {presets} from "./Presets.tsx";
import {ImportExportDialog} from "../../../sweepLine/shared/ImportExportDialog.tsx";

export function InputControl(props: InputControlProps) {

    const setRandomGraph = () => {
        const size = document.getElementById("graphSizeInputSlider") as HTMLInputElement;
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomGraph(size.valueAsNumber, density.valueAsNumber);
        props.setSelected("random");
        props.setInput((input) => {
            return {...input, densityFactor: density.valueAsNumber, graph: graph, timestamp: Date.now()};
        });
    };

    const resetInput = () => {
        props.setInput((input) => {
            return {...input, graph: {nodes: [], edges: []}, timestamp: Date.now()};
        });
        props.setSelected("custom");
        props.setInteraction({type: "idle"});
    };

    return <>
        <div className="control-row">
            <button onClick={resetInput} className="control-button" style={{flex: 4}} >Reset</button>
            <ImportExportDialog
                mode="input"
                createExportString={() => ""}
                onImport={props.onImport}
            />
            <ImportExportDialog
                mode="output"
                createExportString={props.createExportString}
                onImport={() => {}}
            />
        </div>
        <div className="control-row">
            <div className="control-button">
                <div >Preset:</div>
                <select
                    value={props.selected}
                    onChange={(e) => {
                        const selected = e.target.value;
                        props.setSelected(selected);
                        if(selected === "random") {
                            setRandomGraph();
                        } else if (selected !== "custom") {
                            props.onImport(presets.filter(preset => preset.name === selected)[0].importString);
                        }
                    }}
                >
                    {presets.map(preset => {
                        return <option value={preset.name} >{preset.name}</option>;
                    })}
                    <option value="random" >random</option>
                    <option value="custom" >custom</option>
                </select>
            </div>
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
        graph.nodes.push({x: xCoordinate, y: yCoordinate, id: getRandomId()})
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