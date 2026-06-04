import type { InputControlProps } from "./Types.tsx";
import type { Graph } from "../shared/Types.tsx";

import { getRandomId } from "../shared/Utils.tsx";

export function InputControl(props: InputControlProps ) {

    const setRandomGraph = () => {
        const size = document.getElementById("graphSizeInputSlider") as HTMLInputElement;
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomGraph(size.valueAsNumber, density.valueAsNumber);
        props.setInput((input) => {
            return { ...input, densityFactor: density.valueAsNumber, graph: graph, timestamp: Date.now() };
        });
    };

    const resetInput = () => {
        props.setInput((input) => {
            return { ...input, graph: { nodes: [], edges: [] }, timestamp: Date.now() };
        });
        props.setInteraction({ type: "idle" });
    };

    return <div className="control-row" >
        <button onClick={ resetInput } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Reset</button>
        <div style={ { display: "flex", gap: 3 } }>
            <div style={ { display: "flex", flexDirection: "column", flex: 1, border: "2px solid black", borderRadius: "30px", alignItems: "center" } } >
                <label htmlFor={ "graphSizeInputSlider" }>Number of Nodes: { props.input.graph.nodes.length }</label>
                <input id={ "graphSizeInputSlider" } type={ "range" } min={ 0 } max={ 50 } step={ 1 } value={ props.input.graph.nodes.length } onInput={ setRandomGraph } style={ { width: "90%" } } />
            </div>
            <div style={ { display: "flex", flexDirection: "column", flex: 1, border: "2px solid black", borderRadius: "30px", alignItems: "center" } } >
                <label htmlFor={ "graphDensityInputSlider" } >Density Factor: { props.input.densityFactor.toString().slice(0,4) }</label>
                <input id={ "graphDensityInputSlider" } type={ "range" } min={ 0 } max={ 1 } step={ "any" } value={ props.input.densityFactor } onInput={ setRandomGraph } style={ { width: "90%" } } />
            </div>
        </div>
    </div>;
}

function getRandomGraph(n: number, d: number) : Graph {
    const graph: Graph = {nodes: [], edges: []};

    for (let i = 0; i < n; i++) {
        const xCoordinate = ((Math.cos((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        const yCoordinate = ((Math.sin((i * 2 * Math.PI) / n) + 1.1) * 0.45);
        graph.nodes.push({ x: xCoordinate, y: yCoordinate, id: getRandomId() })
    }

    for (let i = 0; i < graph.nodes.length; i++) {
        for (let j = i+1; j < graph.nodes.length; j++) {
            if(Math.random() < d) {
                graph.edges.push({fromId: graph.nodes[i].id, toId: graph.nodes[j].id, id: getRandomId() });
            }
        }
    }
    return graph;
}