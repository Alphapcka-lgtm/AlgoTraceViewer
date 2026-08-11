import type {Point, DynamicPointsProps, XPointProps, XPointWithCordsProps} from "./Types.tsx";
import {useLayoutEffect, useRef, useState} from "react";

export function DynamicPoints(props: DynamicPointsProps) {
    return props.points.map((point: Point) => (
        <g
            key={point.id}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
                e.stopPropagation();
                props.onMouseDown(point.id);
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                props.onMouseUp();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                props.onDoubleClick(point.id);
            }}
        >
            <XPointWithCords point={point}/>
        </g>
    ));
}

export function XPointWithCords({point, registerPointRefsInMap}: XPointWithCordsProps) {
    const [isHovering, setIsHovering] = useState(false);

    const visualGroupRef = useRef<SVGGElement>(null);
    const pointVisualRef = useRef<SVGGElement>(null);
    const currentMarkerRef = useRef<SVGCircleElement>(null);
    const activeRingRef = useRef<SVGCircleElement>(null);
    const candidateRingRef = useRef<SVGCircleElement>(null);

    useLayoutEffect(() => {
        const group = visualGroupRef.current;
        const pointVisual = pointVisualRef.current;
        const currentMarker = currentMarkerRef.current;
        const activeRing = activeRingRef.current;
        const candidateRing = candidateRingRef.current;

        if (!group || !pointVisual || !currentMarker || !activeRing ||!candidateRing) return;
        //wenn nach rendern react die refs auf die echten svg-dom-elemente gesestzt hat, die in die map zu speichern
        registerPointRefsInMap?.(point.id, {group, pointVisual: pointVisual, currentMarker, activeRing, candidateRing});

        return () => {registerPointRefsInMap?.(point.id, null);}; //wenn punkt aus dom verschwindet ihn auch aus map entfernen
    }, [point.id, registerPointRefsInMap]);

    return (
        <g onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
            <XPoint
                point={point}
                visualGroupRef={visualGroupRef}
                currentMarkerRef={currentMarkerRef}
                pointVisualRef={pointVisualRef}
                activeRingRef={activeRingRef}
                candidateRingRef={candidateRingRef}
            />
            {isHovering && (
                <text
                    x={point.x + 12} y={point.y + 22} fill="black" fontSize="12" fontFamily="monospace">
                    ({Math.round(point.x)}, {Math.round(point.y)})
                </text>
            )}
        </g>
    );
}

export function XPoint({point, visualGroupRef, pointVisualRef, currentMarkerRef, activeRingRef, candidateRingRef}: XPointProps) {
    const NODE_SIZE = 4;
    const HITBOX_RADIUS = 3;
    const RING_RADIUS = 9;

    const DEFAULT_NODE_COLOR = "#222222";//"#555";
    const ACTIVE_RING_COLOR = DEFAULT_NODE_COLOR;
    const CANDIDATE_RING_COLOR = "rgb(204,14,119)";
    const CURRENT_MARKER_COLOR = "#ff0000";//"#F25C54";

    return (
        <g transform={`translate(${point.x}, ${point.y})`}>
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
                    r={RING_RADIUS+2}
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
                    r={RING_RADIUS-1.21}
                    fill={CURRENT_MARKER_COLOR}
                    opacity={0}
                    pointerEvents="none"
                />
                {/* farbe wird von gsap kontrolliert */}
                <g ref={pointVisualRef} color={DEFAULT_NODE_COLOR}>
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
                        {point.label}
                    </text>
                </g>
            </g>
        </g>
    );
}