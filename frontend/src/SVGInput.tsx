import React, {useState, useRef} from "react";
import {Edges, PreviewEdge} from "./Edges";
import {DynamicNodes} from "./Nodes";
import {getRandomId} from "./Utils.tsx";

import type {SVGInputProps, Interaction, Node, Edge, Graph} from "./Types.tsx";

export function SVGInput(props: SVGInputProps) {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });
    const didNodeMove = useRef(false);

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const edgeExists = (a: string, b: string, edges: Edge[]) =>
        edges.some(
            (e) =>
                (e.fromId === a && e.toId === b) ||
                (e.fromId === b && e.toId === a)
        );

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type !== "idle") {
            setInteraction({ type: "idle" });
            return;
        }

        const { x, y } = getMousePos(e);
        console.log(x, y);
        setNodes((prev) => [...prev, { x, y, id: getRandomId() }]);
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const pos = getMousePos(e);

        setInteraction((prev) => {
            switch (prev.type) {
                case "drawing-edge":
                    return { ...prev, to: pos };
                case "dragging":
                    didNodeMove.current = true;
                    setNodes((nodes) =>
                        nodes.map((n) => {
                            if (n.id === prev.nodeId) {
                                return { ...n, ...pos };
                            } else {
                                return n;
                            }
                        })
                    );
                    return prev;
                default:
                    return prev;
            }
        });
    };

    const handleNodeClick = (node: Node) => {
        if (didNodeMove.current) {
            didNodeMove.current = false;
            return;
        }

        setInteraction((prev) => {
            if (prev.type === "drawing-edge") {
                setEdges((edges) => {
                    if(edgeExists(prev.fromId, node.id, edges)) {
                        return edges;
                    } else {
                        return [...edges, { fromId: prev.fromId, toId: node.id, id: getRandomId() }];
                    }
                });
                return { type: "idle" };
            }
            return { type: "drawing-edge", fromId: node.id };
        });
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
        setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
        setEdges((edges) =>
            edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId)
        );
        setInteraction({ type: "idle" });
    };

    const setFullyInterconnectedGraph = () => {
        const size = document.getElementById("graphSize") as HTMLInputElement;
        const density = document.getElementById("graphDensity") as HTMLInputElement;
        const graph: Graph = getFullyConnectedGraph(size.valueAsNumber, density.valueAsNumber, 1150, props.height);
        setNodes(graph.nodes);
        setEdges(graph.edges);
    };

    return props.mode == "input" ? (
        <>
            <svg
                height={props.height}
                style={{ border: "1px solid black", borderRadius: "30px" }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
            >
                <Edges nodes={nodes} edges={edges} idPrefix={""} />

                <PreviewEdge interaction={interaction} nodes={nodes} />

                <DynamicNodes
                    nodes={nodes}
                    onClick={handleNodeClick}
                    onMouseDown={handleNodeMouseDown}
                    onMouseUp={handleNodeMouseUp}
                    onDoubleClick={handleNodeDoubleClick}
                />
            </svg>
            <div style={{display: "flex"}}>
                <button style={{flex: 1}} onClick={() => {
                    setNodes([]);
                    setEdges([]);
                    setInteraction({ type: "idle" });
                }}>reset</button>
            </div>

            <button onClick={() => {props.onSubmit({nodes, edges})}}>Submit</button>
            <input id={"graphSize"} type={"range"} min={0} max={100} step={1} onInput={() => setFullyInterconnectedGraph()}/>
            <input id={"graphDensity"} type={"range"} min={0} max={1} step={0.01} onInput={() => setFullyInterconnectedGraph()}/>
        </>
    ) : <></>;
}

function getFullyConnectedGraph(n: number, d: number, w: number, h: number) : Graph {

    const graph: Graph = {nodes: [], edges: []};

    for (let i = 0; i < n; i++) {
        const xCoordinate = ((Math.cos((i * 2 * Math.PI) / n) + 1.1) * w * 0.45);
        const yCoordinate = ((Math.sin((i * 2 * Math.PI) / n) + 1.1) * h * 0.45);
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