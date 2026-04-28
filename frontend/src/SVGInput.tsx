import React, {useState, useRef} from "react";
import {Edges, PreviewEdge} from "./Edges";
import {DynamicNodes} from "./Nodes";
import {getRandomGraph, getRandomId} from "./Utils.tsx";

import type {SVGInputProps, Interaction, Node, Edge, Graph} from "./Types.tsx";

export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });
    const didNodeMove = useRef(false);

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const edgeExists = (a: string, b: string, edges: Edge[]) => edges.some((e) => (e.fromId === a && e.toId === b) || (e.fromId === b && e.toId === a));

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type === "idle") {
            const { x, y } = getMousePos(e);
            props.setInput((prev) => {
                return { ...prev, graph: { ...prev.graph, nodes: [...prev.graph.nodes, { x, y, id: getRandomId() }] }, timestamp: Date.now() };
            });
        } else {
            setInteraction({ type: "idle" });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const pos = getMousePos(e);

        setInteraction((interaction) => {
            if(interaction.type === "drawing-edge"){
                return { ...interaction, to: pos };
            } else if (interaction.type === "dragging"){
                didNodeMove.current = true;
                props.setInput((input) => {
                    return { ...input, graph: { ...input.graph, nodes: input.graph.nodes.map((node) => node.id === interaction.nodeId ? { ...node, ...pos } : node) } , timestamp: Date.now() };
                })
            }
            return interaction;
        });
    };

    const handleNodeClick = (node: Node) => {
        if (didNodeMove.current) {
            didNodeMove.current = false;
        } else {
            setInteraction((interaction) => {
                if (interaction.type === "drawing-edge") {
                    props.setInput((input) => {
                        if (edgeExists(interaction.fromId, node.id, input.graph.edges)) {
                            return input;
                        } else {
                            return { ...input, graph: { ...input.graph, edges: [...input.graph.edges, { fromId: interaction.fromId, toId: node.id, id: getRandomId() }] }, timestamp: Date.now() };
                        }
                    });
                    return { type: "idle" };
                }
                return { type: "drawing-edge", fromId: node.id };
            });

        }
    };

    const handleNodeMouseDown = (nodeId: string) => {
        if (interaction.type === "idle") {
            didNodeMove.current = false;
            setInteraction({ type: "dragging", nodeId });
        }
    };

    const handleNodeMouseUp = () => {
        if (interaction.type === "dragging") {
            setInteraction({ type: "idle" });
        }
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        props.setInput((input) => {
            return { ...input, graph: { nodes: input.graph.nodes.filter((n) => n.id !== nodeId), edges: input.graph.edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId) }, timestamp: Date.now() };
        })
        setInteraction({ type: "idle" });
    };

    const setRandomGraph = () => {
        const size = document.getElementById("graphSizeInputSlider") as HTMLInputElement;
        const density = document.getElementById("graphDensityInputSlider") as HTMLInputElement;
        const graph: Graph = getRandomGraph(size.valueAsNumber, density.valueAsNumber, 1150, props.height);
        props.setInput((input) => {
            return { ...input, densityFactor: density.valueAsNumber, graph: { nodes: graph.nodes, edges: graph.edges }, timestamp: Date.now() };
        });
    };

    const resetInput = () => {
        props.setInput((input) => {
            return { ...input, graph: { nodes: [], edges: [] }, timestamp: Date.now() };
        });
        setInteraction({ type: "idle" });
    }

    return props.mode === "Output" ? <></> : <>
            <svg height={ props.height } style={ { border: "2px solid black", borderRadius: "30px" } } onClick={ handleCanvasClick } onMouseMove={ handleMouseMove } >
                <Edges nodes={ props.input.graph.nodes } edges={ props.input.graph.edges } idPrefix={ "" } />
                <PreviewEdge interaction={ interaction } nodes={ props.input.graph.nodes } />
                <DynamicNodes nodes={ props.input.graph.nodes } onClick={ handleNodeClick } onMouseDown={ handleNodeMouseDown } onMouseUp={ handleNodeMouseUp } onDoubleClick={ handleNodeDoubleClick } />
            </svg>
            <div style={ { display: "flex", flexDirection: "column", gap: 3 } }>
                <button onClick={ () => resetInput() } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Reset</button>
                <div style={ { display: "flex", gap: 3 } }>
                    <div style={ { display: "flex", flexDirection: "column", flex: 1, border: "2px solid black", borderRadius: "30px", alignItems: "center" } } >
                        <label htmlFor={ "graphSizeInputSlider" }>Number of Nodes: { props.input.graph.nodes.length }</label>
                        <input id={ "graphSizeInputSlider" } type={ "range" } min={ 0 } max={ 50 } step={ 1 } value={ props.input.graph.nodes.length } onInput={ () => setRandomGraph() } style={ { width: "90%" } } />
                    </div>
                    <div style={ { display: "flex", flexDirection: "column", flex: 1, border: "2px solid black", borderRadius: "30px", alignItems: "center" } } >
                        <label htmlFor={ "graphDensityInputSlider" } >Density Factor: { props.input.densityFactor.toString().slice(0,4) }</label>
                        <input id={ "graphDensityInputSlider" } type={ "range" } min={ 0 } max={ 1 } step={ "any" } value={ props.input.densityFactor } onInput={ () => setRandomGraph() } style={ { width: "90%" } } />
                    </div>
                </div>
            </div>
        </>;
}