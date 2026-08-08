import type {Node, DynamicNodesProps, XNodeProps, XNodeWithCordsProps} from "./Types.tsx";
import {useLayoutEffect, useRef, useState} from "react";

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
            <XNodeWithCords node={node}/>
        </g>
    ));
}

export function XNodeWithCords({node, registerNodeRefsInMap}: XNodeWithCordsProps) {
    const [isHovering, setIsHovering] = useState(false);

    const visualGroupRef = useRef<SVGGElement>(null);
    const nodeVisualRef = useRef<SVGGElement>(null);
    const currentMarkerRef = useRef<SVGCircleElement>(null);
    const activeRingRef = useRef<SVGCircleElement>(null);
    const candidateRingRef = useRef<SVGCircleElement>(null);

    useLayoutEffect(() => {
        const group = visualGroupRef.current;
        const nodeVisual = nodeVisualRef.current;
        const currentMarker = currentMarkerRef.current;
        const activeRing = activeRingRef.current;
        const candidateRing = candidateRingRef.current;

        if (!group || !nodeVisual || !currentMarker || !activeRing ||!candidateRing) return;
        //wenn nach rendern react die refs auf die echten svg-dom-elemente gesestzt hat, die in die map zu speichern
        registerNodeRefsInMap?.(node.id, {group, nodeVisual: nodeVisual, currentMarker, activeRing, candidateRing});

        return () => {registerNodeRefsInMap?.(node.id, null);}; //wenn punkt aus dom verschwindet ihn auch aus map entfernen
    }, [node.id, registerNodeRefsInMap]);

    return (
        <g onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <XNode
                node={node}
                visualGroupRef={visualGroupRef}
                currentMarkerRef={currentMarkerRef}
                nodeVisualRef={nodeVisualRef}
                activeRingRef={activeRingRef}
                candidateRingRef={candidateRingRef}
            />
            {isHovering && (
                <text
                    x={node.x + 12} y={node.y + 22} fill="black" fontSize="12" fontFamily="monospace">
                    ({Math.round(node.x)}, {Math.round(node.y)})
                </text>
            )}
        </g>
    );
}

export function XNode({node, visualGroupRef, nodeVisualRef, currentMarkerRef, activeRingRef, candidateRingRef}: XNodeProps) {
    const NODE_SIZE = 4;
    const HITBOX_RADIUS = 3;
    const RING_RADIUS = 9;

    const DEFAULT_NODE_COLOR = "#222222";//"#555";
    const ACTIVE_RING_COLOR = DEFAULT_NODE_COLOR;
    const CANDIDATE_RING_COLOR = DEFAULT_NODE_COLOR;
    const CURRENT_MARKER_COLOR = "#d55643";

    return (
        <g transform={`translate(${node.x}, ${node.y})`}>
            <g ref={visualGroupRef}>
                <circle
                    ref={activeRingRef}
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={ACTIVE_RING_COLOR}
                    strokeWidth={2.5}
                    opacity={0}
                    pointerEvents="none"
                />
                <circle
                    ref={candidateRingRef}
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={CANDIDATE_RING_COLOR}
                    strokeWidth={2.5}
                    strokeDasharray="3 2"
                    opacity={0}
                    pointerEvents="none"
                />
                <circle
                    cx={0}
                    cy={0}
                    r={HITBOX_RADIUS}
                    fill="transparent"
                    pointerEvents="all"
                />
                <circle
                    ref={currentMarkerRef}
                    cx={0}
                    cy={0}
                    r={RING_RADIUS-1.25}
                    fill={CURRENT_MARKER_COLOR}
                    opacity={0}
                    pointerEvents="none"
                />
                {/* farbe wird von gsap kontrolliert */}
                <g ref={nodeVisualRef} color={DEFAULT_NODE_COLOR}>
                    <line
                        x1={-NODE_SIZE}
                        y1={-NODE_SIZE}
                        x2={NODE_SIZE}
                        y2={NODE_SIZE}
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        pointerEvents="none"
                    />
                    <line
                        x1={NODE_SIZE}
                        y1={-NODE_SIZE}
                        x2={-NODE_SIZE}
                        y2={NODE_SIZE}
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        pointerEvents="none"
                    />
                    <text
                        x={10}
                        y={-10}
                        fontSize="13"
                        fontFamily="monospace"
                        fill="currentColor"
                        pointerEvents="none"
                    >
                        {node.label}
                    </text>
                </g>
            </g>
        </g>
    );
}