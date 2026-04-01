import type {Edge} from "./Edges";

export type Node = { x: number; y: number; id: number };

export type Graph = {nodes: Node[], edges: Edge[]};

export function Nodes({ nodes, onClick, onMouseDown, onMouseUp, onDoubleClick }: any) {
    return nodes.map((n: Node, i: number) => (
        <g
            key={n.id}
            onMouseDown={(e) => {
                e.stopPropagation();
                onMouseDown(n.id);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                onMouseUp();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onDoubleClick(n.id);
            }}
            onClick={(e) => {
                e.stopPropagation();
                onClick(n);
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