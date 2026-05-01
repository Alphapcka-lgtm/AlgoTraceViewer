import type { Node, NodesProps } from "./Types.tsx";

export function Nodes(props: NodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id.toString()}
            key={n.id}
            onMouseDown={(e) => {
                e.stopPropagation();
                props.onMouseDown(n.id);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                props.onMouseUp();
            }}
            onClick={(e) => {
                e.stopPropagation();
                props.onClick(n);
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                props.onDoubleClick(n.id);
            }}
        >
            <circle cx={1920 * n.x} cy={1080 * n.y} r={20} fill="black" />
            <circle cx={1920 * n.x} cy={1080 * n.y} r={15} fill="white" />
            <text
                x={1920 * n.x}
                y={1080 * n.y}
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
