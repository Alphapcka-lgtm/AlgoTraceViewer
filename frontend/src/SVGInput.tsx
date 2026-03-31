import React, { useState, useRef } from "react";
import {Edges, PreviewEdge} from "./Edges";
import type {Node} from "./Nodes";
import type {Edge} from "./Edges";
import {Nodes} from "./Nodes";

type Interaction =
    | { type: "idle" }
    | { type: "dragging"; nodeId: number }
    | { type: "drawing-edge"; fromId: number; to?: { x: number; y: number } };

export function SVGInput() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [interaction, setInteraction] = useState<Interaction>({ type: "idle" });
    const didNodeMove = useRef(false);

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const getNodeById = (id: number) => nodes.find((n) => n.id === id)!;

    const edgeExists = (a: number, b: number, edges: Edge[]) =>
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
        setNodes((prev) => [...prev, { x, y, id: Date.now() }]);
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
                        return [...edges, { fromId: prev.fromId, toId: node.id, id: Date.now() }];
                    }
                });
                return { type: "idle" };
            }

            return { type: "drawing-edge", fromId: node.id };
        });
    };

    const handleNodeMouseDown = (nodeId: number) => {
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

    const handleNodeDoubleClick = (nodeId: number) => {
        setNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
        setEdges((edges) =>
            edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId)
        );
        setInteraction({ type: "idle" });
    };

    return (
        <>
            <svg
                height={500}
                style={{ border: "1px solid black", borderRadius: "30px" }}
                onClick={handleCanvasClick}
                onMouseMove={handleMouseMove}
            >
                <Edges edges={edges} getNode={getNodeById} />

                <PreviewEdge interaction={interaction} getNode={getNodeById} />

                <Nodes
                    nodes={nodes}
                    onClick={handleNodeClick}
                    onMouseDown={handleNodeMouseDown}
                    onMouseUp={handleNodeMouseUp}
                    onDoubleClick={handleNodeDoubleClick}
                />
            </svg>

            <button onClick={() => {
                setNodes([]);
                setEdges([]);
                setInteraction({ type: "idle" });
            }}>reset</button>

            <button onClick={() => {
                fetch("http://localhost:8080/test", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nodes, edges }),
                })
                    .then((r) => r.json())
                    .then(console.log);
            }}>submit</button>
        </>
    );
}