import {IOModeTabs} from "../../sweepLine/shared/IOModeTabs.tsx";
import {getRandomId} from "../../sweepLine/shared/Utils.tsx";
import type {Interaction, SVGInputProps} from "./Types.tsx";
import type {Node} from "../../sweepLine/shared/Types.tsx"
import {Edges, PreviewEdge} from "../shared/Edges.tsx";
import {InputControl} from "./InputControl.tsx";
import type {Edge} from "../shared/Types.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {useRef, useState} from "react";
import * as React from "react";

export function SVGInput(props: SVGInputProps) {
    const [interaction, setInteraction] = useState<Interaction>({type: "idle"});
    const didNodeMove = useRef(false);

    const getRelativeCoordinates = (e: React.MouseEvent<SVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        return {x: Math.floor(e.clientX - rect.left), y: Math.floor(e.clientY - rect.top)};
    }

    const edgeExists = (a: string, b: string, edges: Edge[]) => edges.some((e) => (e.fromId === a && e.toId === b) || (e.fromId === b && e.toId === a));

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (interaction.type === "idle") {
            const {x, y} = getRelativeCoordinates(e);
            props.setInput((input) => {
                return {
                    ...input,
                    graph: {...input.graph, nodes: [...input.graph.nodes, {x, y, id: getRandomId(), label: ""}]},
                    preset: "custom",
                    timestamp: Date.now()
                };
            });
        } else {
            setInteraction({type: "idle"});
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const pos = getRelativeCoordinates(e);

        if (interaction.type === "drawing-edge") {
            setInteraction({...interaction, to: pos});
        } else if (interaction.type === "dragging") {
            didNodeMove.current = true;
            props.setInput((input) => {
                return {
                    ...input,
                    graph: {
                        ...input.graph,
                        nodes: input.graph.nodes.map((node) => node.id === interaction.nodeId ? {...node, ...pos} : node)
                    },
                    preset: "custom",
                    timestamp: Date.now()
                };
            });
        }
    };

    const handleNodeClick = (node: Node) => {
        if (didNodeMove.current) {
            didNodeMove.current = false;
        } else if (interaction.type === "drawing-edge") {
            props.setInput((input) => {
                if (edgeExists(interaction.fromId, node.id, input.graph.edges)) {
                    return input;
                } else {
                    return {
                        ...input,
                        graph: {
                            ...input.graph,
                            edges: [...input.graph.edges, {
                                fromId: interaction.fromId,
                                toId: node.id,
                                id: getRandomId()
                            }]
                        },
                        preset: "custom",
                        timestamp: Date.now()
                    };
                }
            });
            setInteraction({type: "idle"});
        } else {
            setInteraction({type: "drawing-edge", fromId: node.id})
        }
    };

    const handleNodeMouseDown = (nodeId: string) => {
        if (interaction.type === "idle") {
            didNodeMove.current = false;
            setInteraction({type: "dragging", nodeId});
        }
    };

    const handleNodeMouseUp = () => {
        if (interaction.type === "dragging") {
            setInteraction({type: "idle"});
        }
    };

    const handleNodeDoubleClick = (nodeId: string) => {
        props.setInput((input) => {
            return {
                ...input,
                graph: {
                    nodes: input.graph.nodes.filter((n) => n.id !== nodeId),
                    edges: input.graph.edges.filter((e) => e.fromId !== nodeId && e.toId !== nodeId)
                },
                preset: "custom",
                timestamp: Date.now()
            };
        })
        setInteraction({type: "idle"});
    };

    const eventHandler = {
        onClick: handleNodeClick,
        onMouseDown: handleNodeMouseDown,
        onMouseUp: handleNodeMouseUp,
        onDoubleClick: handleNodeDoubleClick
    };

    return <div className="algorithm-panel">
        <IOModeTabs
            mode="input"
            onChangeInput={() => {
            }}
            onSubmit={() => props.onSubmit(props.input)}
            canSubmit={props.input.graph.edges.length > 0}
        />
        <svg className="algorithm-canvas" onClick={handleCanvasClick} onMouseMove={handleMouseMove}
             viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
            <PreviewEdge nodes={props.input.graph.nodes} interaction={interaction}/>
            <Edges nodes={props.input.graph.nodes} edges={props.input.graph.edges}/>
            <Nodes nodes={props.input.graph.nodes} {...eventHandler} />
        </svg>
        <InputControl
            setInput={props.setInput}
            input={props.input}
            setInteraction={setInteraction}
            createExportString={props.createExportString}
            onImport={props.onImport}
        />
    </div>;
}