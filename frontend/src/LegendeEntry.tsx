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

type CircleNodeIconProps = {
    fill: string;
    stroke?: string;
};

export function CircleNodeIcon({ fill, stroke = "black" }: CircleNodeIconProps) {
    return (
        <>
            <circle cx={10} cy={10} r={10} fill={stroke} />
            <circle cx={10} cy={10} r={8} fill={fill} />
        </>
    );
}

type EdgeIconProps = {
    stroke: string;
    strokeWidth?: number;
};

export function EdgeIcon({ stroke, strokeWidth = 2 }: EdgeIconProps) {
    return (
        <path
            d="M 3 17 L 17 3"
            stroke={stroke}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
        />
    );
}

type XNodeIconProps = {
    fill: string;
    ringStyle?: RingStyle;
}

export function XNodeIcon({fill, ringStyle = "none"}: XNodeIconProps) {
    const NODE_SIZE = 4;
    const RING_RADIUS = 9;
    return (
        <g transform={`translate(${10}, ${10})`}>
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
            />

            <line
                x1={NODE_SIZE}
                y1={-NODE_SIZE}
                x2={-NODE_SIZE}
                y2={NODE_SIZE}
                stroke={fill}
                strokeWidth={3}
            />
        </g>
    );
}