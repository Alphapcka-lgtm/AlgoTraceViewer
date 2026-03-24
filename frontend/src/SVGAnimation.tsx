import {useGSAP} from "@gsap/react";

export function SVGAnimation() {
    useGSAP(() => {

    })
    return <svg height={200}>
        <g>
            <circle cx={100} cy={100} r={10} fill="black" />
            <text x={100} y={100} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" pointerEvents="none">0</text>
        </g>
        <g>
            <circle cx={200} cy={100} r={10} fill="black" />
            <text x={200} y={100} textAnchor="middle" dominantBaseline="central" fill="white" fontSize="10" pointerEvents="none">1</text>
        </g>
    </svg>
}