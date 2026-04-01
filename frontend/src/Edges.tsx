import type {Edge, Node, Graph, Interaction} from "./Types.tsx";
import {getNodeById} from "./Utils.tsx";

export function Edges(props: Graph) {
    return props.edges.map((e: Edge) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        return (
            <line
                key={e.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="black"
                strokeWidth={1}
            />
        );
    });
}

type PreviewEdgeProps = {interaction: Interaction, nodes: Node[]};

export function PreviewEdge(props: PreviewEdgeProps) {
    if (props.interaction.type !== "drawing-edge" || !props.interaction.to) return null;

    const from = getNodeById(props.nodes, props.interaction.fromId);

    return (
        <line
            key={-1}
            x1={from.x}
            y1={from.y}
            x2={props.interaction.to.x}
            y2={props.interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />
    );
}