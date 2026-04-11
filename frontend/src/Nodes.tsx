import type { Node, DynamicNodesProps } from "./Types";

export function DynamicNodes(props: DynamicNodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
            key={n.id}
            onMouseDown={(e) => {
                e.stopPropagation();
                props.onMouseDown(n.id);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                props.onMouseUp();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                props.onDoubleClick(n.id);
            }}
        >
            <circle cx={n.x} cy={n.y} r={11} fill="black" />
            <circle cx={n.x} cy={n.y} r={10} fill="white" />
            <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="10"
                pointerEvents="none"
            >
                {i}
            </text>
        </g>
    ));
}