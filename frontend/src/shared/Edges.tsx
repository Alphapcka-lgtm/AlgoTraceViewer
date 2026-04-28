import type { Edge, PreviewEdgeProps, EdgesProps } from "./Types.tsx";

import { getNodeById } from "./Utils.tsx";

export function Edges(props: EdgesProps) {
    return props.edges.map((e: Edge) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        const p = "M " + (from.x) + " " + (from.y) + " L " + (to.x) + " " + (to.y);

        return (
            <path
                id={ e.id.toString() }
                key={e.id}
                d={p}
                stroke="black"
                strokeWidth={2}
            />
        );
    });
}

export function PreviewEdge(props: PreviewEdgeProps) {
    if(props.interaction.type === "drawing-edge" && props.interaction.to) {
        const node = getNodeById(props.nodes, props.interaction.fromId);
        return <line
            key={-1}
            x1={node.x}
            y1={node.y}
            x2={props.interaction.to.x}
            y2={props.interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />;
    }

    }