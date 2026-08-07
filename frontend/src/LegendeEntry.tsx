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
    fill: string;
    ringStyle?: RingStyle;
    scale?: number;
}

export function XNodeIcon({fill, ringStyle = "none", scale=1}: XNodeIconProps) {
    const NODE_SIZE = 4;
    const RING_RADIUS = 9;
    return (
        <g transform={`translate(${10}, ${10}) scale(${scale})`}>
            {ringStyle !== "none" && (
                <circle
                    cx={0}
                    cy={0}
                    r={RING_RADIUS}
                    fill="none"
                    stroke={fill}
                    strokeWidth={2.5}
                    strokeDasharray={ringStyle === "candidate" ? "3 2" : undefined}
                />
            )}

            <line
                x1={-NODE_SIZE}
                y1={-NODE_SIZE}
                x2={NODE_SIZE}
                y2={NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
            />

            <line
                x1={NODE_SIZE}
                y1={-NODE_SIZE}
                x2={-NODE_SIZE}
                y2={NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
                strokeLinecap="round"
            />
        </g>
    );
}