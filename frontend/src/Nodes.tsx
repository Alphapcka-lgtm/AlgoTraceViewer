import type {Node, DynamicNodesProps, StaticNodesProps} from "./Types";

export function DynamicNodes(props: DynamicNodesProps) {
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

export function StaticNodes(props: StaticNodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id.toString()}
            key={n.id}
        >
            <circle cx={n.x} cy={n.y} r={11} fill="black"/>
            <circle cx={n.x} cy={n.y} r={10} fill="white"/>
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