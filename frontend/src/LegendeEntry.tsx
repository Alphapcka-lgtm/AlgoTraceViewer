import type {ReactNode} from "react";
import type {RingStyle} from "./closestPair/shared/Types.tsx";
import {POINT_COLORS} from "./closestPair/shared/Utils.ts";
import {COLORS} from "./vertexCover/shared/Utils.tsx";

type LegendEntryProps = {
    label: string;
    value: string;
    icon: ReactNode;
};

export function LegendEntry({label, value, icon}: LegendEntryProps) {
    return (
        <div className="legend-entry">
            <svg className="legend-entry-icon" width={18} height={18} viewBox="0 0 20 20">
                {icon}
            </svg>
            <span><strong>{label}</strong>{value}</span>
        </div>
    );
}

type XPointIconProps = {
    color: string;
    ringStyle?: RingStyle;
    variant?: "default" | "current";
};

export function XPointIcon({color, ringStyle = "none", variant = "default"}: XPointIconProps) {
    const NODE_SIZE = 4.5;
    const RING_RADIUS = 8;
    const CURRENT_MARKER_RADIUS = RING_RADIUS + 0.5;
    const X_STROKE_WIDTH = 3;
    const RING_STROKE_WIDTH = 2.4;
    return (
        <g transform="translate(10, 10)">
            {variant === "current" && (
                <circle
                    cx={0}
                    cy={0}
                    r={CURRENT_MARKER_RADIUS}
                    fill={POINT_COLORS.currentMarker}
                />
            )}
            <line
                x1={-NODE_SIZE}
                y1={-NODE_SIZE}
                x2={NODE_SIZE}
                y2={NODE_SIZE}
                stroke={color}
                strokeWidth={X_STROKE_WIDTH}
                strokeLinecap="round"
            />
            <line
                x1={NODE_SIZE}
                y1={-NODE_SIZE}
                x2={-NODE_SIZE}
                y2={NODE_SIZE}
                stroke={color}
                strokeWidth={X_STROKE_WIDTH}
                strokeLinecap="round"
            />
            {(ringStyle === "active" || ringStyle === "candidate") && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={POINT_COLORS.default}
                    strokeWidth={RING_STROKE_WIDTH}
                />
            )}
            {ringStyle === "candidate" && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS + 1.8}
                    fill="none"
                    stroke={POINT_COLORS.candidateRing}
                    strokeWidth={RING_STROKE_WIDTH}
                    strokeDasharray="3 1"
                />
            )}
        </g>
    );
}

export function NodeIcon() {
    return (
        <>
            <circle cx={9} cy={9} r={9} fill={COLORS.black}/>
            <circle cx={9} cy={9} r={8} fill={COLORS.orange}/>
            <circle cx={9} cy={9} r={7} fill={COLORS.black}/>
            <circle cx={9} cy={9} r={6} fill={COLORS.orange}/>
        </>
    );
}

export function RemainingEdgeIcon() {
    return (
        <>
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={COLORS.blue}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={COLORS.black}
                strokeWidth={2}
            />
        </>
    );
}

export function ArbitraryEdgeIcon() {
    return (
        <>
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={COLORS.red}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke={COLORS.black}
                strokeWidth={2}
            />
        </>
    );
}