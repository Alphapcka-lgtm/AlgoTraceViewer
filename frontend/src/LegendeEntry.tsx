import type { ReactNode } from "react";
import type {RingStyle} from "./sweepLine/shared/Types.tsx";

type LegendEntryProps = {
    label: string;
    value: string;
    icon: ReactNode;
};

export function LegendEntry({ label, value, icon }: LegendEntryProps) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap:6}}>
            <svg width={18} height={18} viewBox="0 0 20 20" style={{ overflow: "visible" }}>
                {icon}
            </svg>
            <span><strong>{label}</strong>{value}</span>
        </div>
    );
}

type XNodeIconProps = {
    color: string;
    ringStyle?: RingStyle;
    variant?: "default" | "current";
};

export function XNodeIcon({color, ringStyle = "none", variant = "default"}: XNodeIconProps) {
    const NODE_SIZE = 4;
    const RING_RADIUS = 9;
    const CURRENT_MARKER_RADIUS = RING_RADIUS-1.25;

    const DEFAULT_NODE_COLOR = "#222222";//"#555";
    const ACTIVE_RING_COLOR = DEFAULT_NODE_COLOR;
    const CANDIDATE_RING_COLOR = "rgb(204,14,119)";
    const CURRENT_MARKER_COLOR = "#F25C54";

    return (
        <g transform={`translate(10, 10)`}>
            {(ringStyle === "active" || ringStyle === "candidate") && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={ACTIVE_RING_COLOR}
                    strokeWidth={2.5}
                />
            )}
            {ringStyle === "candidate" && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS + 2}
                    fill="none"
                    stroke={CANDIDATE_RING_COLOR}
                    strokeWidth={2.5}
                    strokeDasharray="3 2"
                />
            )}
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
                strokeWidth={3}
                strokeLinecap="round"
            />
            <line
                x1={NODE_SIZE}
                y1={-NODE_SIZE}
                x2={-NODE_SIZE}
                y2={NODE_SIZE}
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
            />
        </g>
    );
}