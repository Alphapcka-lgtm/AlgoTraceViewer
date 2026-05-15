import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { AlgorithmStepDTO, Node, SVGOutputProps } from "./Types";
import { OutputControl2 } from "./OutputControl2";
import { XNode } from "./Nodes.tsx";
import { btnStyle } from "./Utils.tsx";

const STEP_DURATION = 0.9;
const PADDING = 30;

export function SVGOutput3(props: SVGOutputProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const sweepLineRef = useRef<SVGLineElement>(null);
    const sweepRectRef = useRef<SVGRectElement>(null);

    const step: AlgorithmStepDTO | undefined = props.steps[currentStep];

    const isAtEnd = currentStep >= props.steps.length - 1;
    const actuallyPlaying = isPlaying && !isAtEnd;

    useGSAP(() => {
        if (!step || !sweepLineRef.current || !sweepRectRef.current) return;

        const x = step.sweepLineX;
        const delta = step.delta;
        const cy = step.currentPoint?.y ?? props.height / 2;

        gsap.killTweensOf([sweepLineRef.current, sweepRectRef.current]);

        gsap.to(sweepLineRef.current, {
            attr: { x1: x, x2: x },
            duration: STEP_DURATION,
            ease: "power2.inOut",
        });

        gsap.to(sweepRectRef.current, {
            attr: {
                x: x - delta,
                y: cy - delta,
                width: delta,
                height: delta * 2,
            },
            duration: STEP_DURATION,
            ease: "power2.inOut",
        });
    }, {
        scope: containerRef,
        dependencies: [currentStep],
    });

    useEffect(() => {
        if (!actuallyPlaying) return;
        const timeoutId = setTimeout(() => {
            setCurrentStep((prev) => prev + 1);
        }, (STEP_DURATION + 0.2) * 1000);
        return () => clearTimeout(timeoutId);
    }, [actuallyPlaying, currentStep]);

    if (props.loading) {
        return <p style={{ fontFamily: "monospace" }}>Loading...</p>;
    }

    if (props.error) {
        return <p style={{ fontFamily: "monospace", color: "red" }}>Error: {props.error}</p>;
    }

    if (!step) {
        return <></>;
    }

    const firstStep = props.steps[0];

    return (
        <div ref={containerRef} style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "20px" }}>

            <button
                onClick={props.onChangeInput}
                style={{ ...btnStyle, width: "50%" }}
            >
                ← Change input
            </button>

            <svg
                width={props.width}
                height={props.height}
                style={{ border: "2px solid black", borderRadius: "30px" }}
                viewBox={`0 0 ${props.width} ${props.height}`}
            >
                <rect
                    ref={sweepRectRef}
                    x={firstStep.sweepLineX - firstStep.delta}
                    y={(firstStep.currentPoint?.y ?? props.height / 2) - firstStep.delta}
                    width={firstStep.delta}
                    height={firstStep.delta * 2}
                    fill="rgba(255,107,53,0.08)"
                    stroke="rgba(255,107,53,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                />

                <line
                    ref={sweepLineRef}
                    x1={firstStep.sweepLineX}
                    y1={PADDING}
                    x2={firstStep.sweepLineX}
                    y2={props.height - PADDING}
                    stroke="#ff6b35"
                    strokeWidth="2"
                />

                {step.allPoints.map((p: Node) => {
                    const isCurrent = p.id === step.currentPoint?.id;
                    const isActive = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed = step.processedPoints.some((d) => d.id === p.id);
                    const isBest =
                        p.id === step.bestPair?.p0?.id ||
                        p.id === step.bestPair?.p1?.id;

                    const fill =
                        isCurrent ? "#ff6b35"
                            : isBest ? "#ffd700"
                                : isActive ? "#00e5ff"
                                    : isProcessed ? "#888"
                                        : "#4a9eff";

                    return (
                        <XNode key={p.id} node={p} fill={fill} />
                    );
                })}
            </svg>

            <div
                style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 16px",
                }}
            >
                <div> Step: <strong>{currentStep + 1} / {props.steps.length}</strong> </div>

                <div> δ: <strong>{step.delta.toFixed(2)}</strong> </div>

                <div> Current Point: <strong>{step.currentPoint?.label}</strong> </div>

                <div>
                    Best Pair:{" "} <strong> {step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"} </strong>
                </div>

                <div style={{ gridColumn: "1 / -1", color: "#555" }}> {step.description} </div>
            </div>

            <OutputControl2
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                stepCount={props.steps.length}
                isPlaying={actuallyPlaying}
                setIsPlaying={setIsPlaying}
            />

            <div style={{ fontFamily: "monospace", fontSize: 13 }}>
                <div>
                    <strong>Active Points:</strong>{" "}
                    {step.activePoints.length === 0 ? "No active points"
                        : step.activePoints.map((p) => p.label).join(", ")}
                </div>

                <div>
                    <strong>Candidates:</strong>{" "}
                    {step.candidatePairs.length === 0 ? "No candidates in this step" : step.candidatePairs
                            .map((res) => `dist(${res.p0.label}, ${res.p1.label}) = ${res.distance.toFixed(2)}`)
                            .join("; ")
                    }
                </div>
            </div>
        </div>
    );
}