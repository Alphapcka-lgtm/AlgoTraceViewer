import type { Node, DynamicNodesProps, XNodeProps } from "./Types.tsx";
import {useState} from "react";
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
            <XNodeWithCords node={n} fill={"black"}/>
        </g>
    ));
}


export function XNodeWithCords({ node, fill }: XNodeProps) {

    const [isHovering, setIsHovering] = useState(false);

    return (
        <g onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <XNode node={node} fill={fill} />
            {isHovering && (
                <text x={node.x + 10} y={node.y + 20} fill="black" fontSize="12" fontFamily="monospace">
                    ({node.x}, {node.y})
                </text>
            )}
        </g>
    );
}

export function XNode({ node, fill }: XNodeProps) {
    const NODE_SIZE = 4;
    const HITBOX_RADIUS = 8;

    return (
        <g>
            <circle
                cx={node.x}
                cy={node.y}
                r={HITBOX_RADIUS}
                fill="transparent"
                pointerEvents="all"
            />

            <line
                x1={node.x - NODE_SIZE}
                y1={node.y - NODE_SIZE}
                x2={node.x + NODE_SIZE}
                y2={node.y + NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
                pointerEvents="none"
            />

            <line
                x1={node.x + NODE_SIZE}
                y1={node.y - NODE_SIZE}
                x2={node.x - NODE_SIZE}
                y2={node.y + NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
                pointerEvents="none"
            />

            <text
                x={node.x + 10}
                y={node.y - 10}
                fontSize="13"
                fontFamily="monospace"
                fill={fill}
                pointerEvents="none"
            >
                {node.label}
            </text>
        </g>
    );
}