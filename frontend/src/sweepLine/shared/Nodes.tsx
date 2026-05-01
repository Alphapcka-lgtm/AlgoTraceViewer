import type { Node, NodesProps } from "./Types.tsx";

export function Nodes(props: NodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id.toString()}
            key={n.id}
            onClick={(e) => {
                e.stopPropagation();
            }}
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
            <circle cx={n.x} cy={n.y} r={20} fill="black" />
            <circle cx={n.x} cy={n.y} r={15} fill="white" />
            <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="21"
                pointerEvents="none"
            >
                {i}
            </text>
        </g>
    ));
}
