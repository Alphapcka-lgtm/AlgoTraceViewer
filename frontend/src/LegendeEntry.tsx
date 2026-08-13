import type { ReactNode } from "react";
import type {RingStyle} from "./closestPair/shared/Types.tsx";
import {colors} from "./vertexCover/output/PseudoCode.ts";

type LegendEntryProps = {
    label: string;
    value: string;
    icon: ReactNode;
};

export function LegendEntry({ label, value, icon }: LegendEntryProps) {
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
    const ACTIVE_RING_COLOR = "#222222";
    const CANDIDATE_RING_COLOR = "rgb(204,14,119)";
    const CURRENT_MARKER_COLOR = "#ff0000";
    const X_STROKE_WIDTH = 3;
    const RING_STROKE_WIDTH = 2.4;
    return (
        <g transform="translate(10, 10)">
            {variant === "current" && (
                <circle
                    cx={0}
                    cy={0}
                    r={CURRENT_MARKER_RADIUS}
                    fill={CURRENT_MARKER_COLOR}
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
                    stroke={ACTIVE_RING_COLOR}
                    strokeWidth={RING_STROKE_WIDTH}
                />
            )}
            {ringStyle === "candidate" && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS + 1.8}
                    fill="none"
                    stroke={CANDIDATE_RING_COLOR}
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
            <circle cx={9} cy={9} r={9} fill="black"/>
            <circle cx={9} cy={9} r={8} fill={colors.orange}/>
            <circle cx={9} cy={9} r={7} fill="black"/>
            <circle cx={9} cy={9} r={6} fill={colors.orange}/>
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
                stroke={colors.blue}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke="black"
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
                stroke={colors.red}
                strokeWidth={7}
            />
            <line
                x1={0}
                x2={20}
                y1={0}
                y2={20}
                stroke="black"
                strokeWidth={2}
            />
        </>
    );
}

export function NodeDegreeMapIcon() {
    return (
        <>
            <rect
                x={0}
                y={0}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={10}
                y={0}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={0}
                y={10}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
            <rect
                x={10}
                y={10}
                width={10}
                height={10}
                stroke="black"
                fill="none"
                strokeWidth={2}
            />
        </>
    );
}