import type {Node} from "../../sweepLine/shared/Types.tsx"
import type {Edge, EdgesProps, PreviewEdgeProps} from "./Types.tsx";

export function Edges(props: EdgesProps) {
    return props.edges.map((e: Edge, index) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        const p = "M " + (from.x) + " " + (from.y) + " L " + (to.x) + " " + (to.y);
        const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}

        return (
            <g key={"a" + e.id + index}>
                <path
                    id={"u0" + e.id}
                    key={"u0" + e.id + index}
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.blue}
                    strokeWidth={6}
                />
                <path
                    id={"u1" + e.id}
                    key={"u1" + e.id + index}
                    d={p}
                    style={{opacity: 0}}
                    stroke={colors.red}
                    strokeWidth={7}
                />
                <path
                    id={e.id}
                    key={e.id + index}
                    d={p}
                    stroke="black"
                    strokeWidth={2}
                />
            </g>
        );
    });
}

export function PreviewEdge(props: PreviewEdgeProps) {
    if (props.interaction.type === "drawing-edge" && props.interaction.to) {
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

function getNodeById(nodes: Node[], id: string): Node {
    return nodes.find((n) => n.id === id)!;
}