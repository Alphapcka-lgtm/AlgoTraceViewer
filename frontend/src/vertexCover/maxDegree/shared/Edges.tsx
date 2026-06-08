import type { Edge, EdgesProps } from "./Types.tsx";

import { getNodeById } from "./Utils.tsx";
import type {PreviewEdgeProps} from "../input/Types.tsx";

export function Edges(props: EdgesProps) {
    return props.edges.map((e: Edge) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        const p = "M " + (1123 * from.x) + " " + (500 * from.y) + " L " + (1123 * to.x) + " " + (500 * to.y);
        const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}

        return (
            <g>
                <path
                    id={ "u0" + e.id.toString() }
                    key={ "u0" + e.id }
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.blue}
                    strokeWidth={4}
                />
                <path
                    id={ e.id.toString() }
                    key={e.id}
                    d={p}
                    stroke="black"
                    strokeWidth={2}
                />
            </g>
        );
    });
}

export function PreviewEdge(props: PreviewEdgeProps) {
    if(props.interaction.type === "drawing-edge" && props.interaction.to) {
        const node = getNodeById(props.nodes, props.interaction.fromId);
        return <line
            key={-1}
            x1={1123 * node.x}
            y1={500 * node.y}
            x2={1123 * props.interaction.to.x}
            y2={500 * props.interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />;
    }

    }