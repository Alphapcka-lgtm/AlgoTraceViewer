import {type JSX, useRef} from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

type Point = {
    label: string;
    x: number;
    y: number;
};

function generatePoints(): Point[] {
    return [
        { label: "A", x: 80, y: 80 },
        { label: "B", x: 200, y: 100 },
        { label: "C", x: 300, y: 220 },
        { label: "D", x: 120, y: 300 },
    ];
}

export default function App(): JSX.Element {
    const points: Point[] = generatePoints();

    const pointRefs = useRef<Record<string, SVGCircleElement | null>>({});

    useGSAP(() => {
        const a = pointRefs.current["A"];
        if (!a) return;

        const tl = gsap.timeline();

        for (const p of points) {
            if (p.label === "A") continue;

            tl.to(a, {
                attr: {
                    cx: p.x,
                    cy: p.y,
                },
                duration: 1,
            });

            tl.to({}, { duration: 0.5 });
        }
    }, []);

    return (
        <svg width="600" height="600">
            {points.map((p) => (
                <g key={p.label}>
                    <circle
                        ref={(el) => {
                            pointRefs.current[p.label] = el;
                        }}
                        cx={p.x}
                        cy={p.y}
                        r={12}
                        fill={p.label === "A" ? "red" : "black"}
                    />
                    <text x={p.x + 15} y={p.y + 5}>
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}