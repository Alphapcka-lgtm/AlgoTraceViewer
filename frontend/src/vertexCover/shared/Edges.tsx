import type {Edge, Node, EdgesProps, PreviewEdgeProps} from "./Types.tsx";
import {COLORS} from "./Utils.tsx";

const EDGE_CLASS = "vertex-cover-hidden-edge";

export function Edges(props: EdgesProps) {
    return (
        <>
            {props.edges.map((e: Edge) => {
                const from = getNodeById(props.nodes, e.fromId);
                const to = getNodeById(props.nodes, e.toId);

                const lineProps = {
                    x1: from.x,
                    y1: from.y,
                    x2: to.x,
                    y2: to.y,
                };

                return (
                    <g key={e.id}>
                        <line
                            {...lineProps}
                            id={"blue" + e.id}
                            className={EDGE_CLASS}
                            stroke={COLORS.blue}
                            strokeWidth={5}
                        />

                        <line
                            {...lineProps}
                            id={e.id}
                            stroke={COLORS.black}
                            strokeWidth={2}
                        />
                    </g>
                );
            })}

            {props.edges.map((e: Edge) => {
                const from = getNodeById(props.nodes, e.fromId);
                const to = getNodeById(props.nodes, e.toId);

                const lineProps = {
                    x1: from.x,
                    y1: from.y,
                    x2: to.x,
                    y2: to.y,
                };

                return (
                    <g key={e.id}>
                        <line
                            {...lineProps}
                            id={"red" + e.id}
                            className={EDGE_CLASS}
                            stroke={COLORS.red}
                            strokeWidth={7}
                        />
                    </g>
                );
            })}
        </>
    );
}

export function PreviewEdge(props: PreviewEdgeProps) {
    if (props.interaction.type !== "drawing-edge" || !props.interaction.to) {
        return null;
    }

    const node = getNodeById(props.nodes, props.interaction.fromId);

    return (
        <line
            x1={node.x}
            y1={node.y}
            x2={props.interaction.to.x}
            y2={props.interaction.to.y}
            stroke={COLORS.black}
            strokeWidth={1}
            strokeDasharray="4"
        />
    );
}

function getNodeById(nodes: Node[], id: string): Node {
    return nodes.find((n) => n.id === id)!;
}