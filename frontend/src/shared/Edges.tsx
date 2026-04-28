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
    return props.to ? <line
        key={-1}
        x1={props.fromNode.x}
        y1={props.fromNode.y}
        x2={props.to.x}
        y2={props.to.y}
        stroke="black"
        strokeWidth={1}
        strokeDasharray="4"
    /> : <></>;
}