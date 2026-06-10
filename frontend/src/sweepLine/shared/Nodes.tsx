import type { Node, DynamicNodesProps, XNodeProps } from "./Types.tsx";
import { useState } from "react";

export function DynamicNodes(props: DynamicNodesProps) {
    return props.nodes.map((node: Node) => (
        <g
            key={node.id}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
                e.stopPropagation();
                props.onMouseDown(node.id);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                props.onMouseUp();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                props.onDoubleClick(node.id);
            }}
        >
            <XNodeWithCords node={node} fill="black" />
        </g>
    ));
}

export function XNodeWithCords({ node, fill, scale = 1, ringStyle = "none"}: XNodeProps) {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <g onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <XNode node={node} fill={fill} scale={scale} ringStyle={ringStyle} />
            {isHovering && (
                <text
                    x={node.x + 12} y={node.y + 22} fill="black" fontSize="12" fontFamily="monospace">
                    ({Math.round(node.x)}, {Math.round(node.y)})
                </text>
            )}
        </g>
    );
}

export function XNode({node, fill, scale = 1, ringStyle = "none"}: XNodeProps) {
    const NODE_SIZE = 4;
    const HITBOX_RADIUS = 3;
    const RING_RADIUS = 9;
    //style={{transition: "transform 0.2s ease"}}
    return (
        <g transform={`translate(${node.x}, ${node.y}) scale(${scale})`}>
            {ringStyle !== "none" && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={fill}
                    strokeWidth={1.5}
                    strokeDasharray={ringStyle === "candidate" ? "3 2" : undefined}
                    pointerEvents="none"
                />
            )}

            <circle
                cx={0}
                cy={0}
                r={HITBOX_RADIUS}
                fill="transparent"
                pointerEvents="all"
            />

            <line
                x1={-NODE_SIZE}
                y1={-NODE_SIZE}
                x2={NODE_SIZE}
                y2={NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
                pointerEvents="none"
            />

            <line
                x1={NODE_SIZE}
                y1={-NODE_SIZE}
                x2={-NODE_SIZE}
                y2={NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
                pointerEvents="none"
            />

            <text
                x={10}
                y={-10}
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