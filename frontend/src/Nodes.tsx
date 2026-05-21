import type { Node, DynamicNodesProps, XNodeProps } from "./Types";
//die Punkte zeichnen....

//für den input modus
export function DynamicNodes(props: DynamicNodesProps) {
    return props.nodes.map((n: Node) => (
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
            <XNode node={n} fill={"black"}/>
        </g>
    ));
}


export function XNode({ node, fill }: XNodeProps){
    const NODE_SIZE:number = 6;
    return (
        <g key={node.id}>

            <line
                x1={node.x - NODE_SIZE}
                y1={node.y - NODE_SIZE}
                x2={node.x + NODE_SIZE}
                y2={node.y + NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
            />

            <line
                x1={node.x + NODE_SIZE}
                y1={node.y - NODE_SIZE}
                x2={node.x - NODE_SIZE}
                y2={node.y + NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
            />

            <text
                x={node.x + 10}
                y={node.y - 10}
                fontSize="13"
                fontFamily="monospace"
                fill={fill}
            >
                {node.label}
            </text>

        </g>
    );
}