import type { Node, DynamicNodesProps, StaticNodesProps } from "./Types";

//die Punkte zeichnen....

//für den input modus
export function DynamicNodes(props: DynamicNodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
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
//für den output modus
export function StaticNodes(props: StaticNodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g key={n.id}>
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