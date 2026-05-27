import type { Edge, EdgesProps } from "./Types.tsx";

import { getNodeById } from "./Utils.tsx";
import type {PreviewEdgeProps} from "../input/Types.tsx";

export function Edges(props: EdgesProps) {
    return props.edges.map((e: Edge) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        const p = "M " + (1920 * from.x) + " " + (1080 * from.y) + " L " + (1920 * to.x) + " " + (1080 * to.y);
        const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}

        return (
            <g>
                <path
                    id={ "u0" + e.id.toString() }
                    key={ "u0" + e.id }
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.blue}
                    strokeWidth={9}
                />
                <path
                    id={ "u1" + e.id.toString() }
                    key={ "u1" + e.id }
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.red}
                    strokeWidth={9}
                />
                <path
                    id={ "u2" + e.id.toString() }
                    key={ "u2" + e.id }
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.orange}
                    strokeWidth={9}
                />
                <path
                    id={ "u3" + e.id.toString() }
                    key={ "u3" + e.id }
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.orange}
                    strokeWidth={9}
                />
                <path
                    id={ e.id.toString() }
                    key={e.id}
                    d={p}
                    stroke="black"
                    strokeWidth={3}
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
            x1={1920 * node.x}
            y1={1080 * node.y}
            x2={1920 * props.interaction.to.x}
            y2={1080 * props.interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />;
    }

    }