import React, { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import type {AlgorithmStepDTO, SVGOutputProps} from "../shared/Types.tsx";

const PADDING = 30;
const ANIM_DURATION = 0.9;

export function SVGOutput(props: SVGOutputProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const sweepLineRef = useRef<SVGLineElement>(null);
    const sweepRectRef = useRef<SVGRectElement>(null);

    const step:AlgorithmStepDTO = props.steps[currentStep];

    const isAtStart:boolean = currentStep === 0;
    const isAtEnd:boolean = currentStep >= props.steps.length - 1;

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!step || !sweepLineRef.current || !sweepRectRef.current) {
            return;
        }

        const x:number = step.sweepLineX;
        const delta:number = step.delta;
        const cy:number = step.currentPoint?.y ?? props.height / 2;

        gsap.to(sweepLineRef.current, {
            attr: { x1: x, x2: x },
            duration: ANIM_DURATION,
            ease: "power2.inOut",
        });

        gsap.to(sweepRectRef.current, {
            attr: {
                x: x - delta,
                y: cy - delta,
                width: delta,
                height: delta * 2,
            },
            duration: ANIM_DURATION,
            ease: "power2.inOut",
        });
    }, [currentStep, step, props.height]);

    const play = useCallback(() => {
        if (isAtEnd) return;

        setIsPlaying(true);

        intervalRef.current = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev >= props.steps.length - 1) {
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                    }

                    setIsPlaying(false);
                    return prev;
                }

                return prev + 1;
            });
        }, (ANIM_DURATION + 0.3) * 1000);
    }, [isAtEnd, props.steps.length]);

    const pause = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setIsPlaying(false);
    }, []);

    const reset = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        setIsPlaying(false);
        setCurrentStep(0);
    }, []);

    if (props.loading) {
        return <p>Loading...</p>;
    }

    if (props.error) {
        return <p>Error: {props.error}</p>;
    }

    if (!step) {
        return (
            <div>
                <p>No algorithm steps present </p>
                <button onClick={props.onChangeInput}>Back to input</button>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: 24,
                fontFamily: "monospace",
                //background: "#0f1117",
                //minHeight: "100vh",
                color: "#e0e6ff",
            }}
        >
            <svg
                width={props.width}
                height={props.height}
                viewBox={`0 0 ${props.width} ${props.height}`}
                style={{
                    display: "block",
                    background: "#0d0f18",
                    borderRadius: 16,
                    marginBottom: 16,
                }}
            >
                <rect
                    ref={sweepRectRef}
                    x={step.sweepLineX - step.delta}
                    y={(step.currentPoint?.y ?? props.height / 2) - step.delta}
                    width={step.delta}
                    height={step.delta * 2}
                    fill="rgba(255,107,53,0.08)"
                    stroke="rgba(255,107,53,0.35)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                />

                <line
                    ref={sweepLineRef}
                    x1={step.sweepLineX}
                    y1={PADDING}
                    x2={step.sweepLineX}
                    y2={props.height - PADDING}
                    stroke="#ff6b35"
                    strokeWidth="2"
                />

                {step.allPoints.map((p) => {
                    const isCurrent = p.id === step.currentPoint?.id;
                    const isActive = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed = step.processedPoints.some((d) => d.id === p.id);
                    const isBest = p.id === step.bestPair?.p0?.id || p.id === step.bestPair?.p1?.id;

                    const color = isCurrent
                        ? "#ff6b35" : isBest ? "#ffd700" : isActive ? "#00e5ff" : isProcessed ? "#3a4060" : "#4a9eff";

                    const r = isCurrent ? 8 : isBest ? 7 : isActive ? 6 : 5;

                    return (
                        <g key={p.id}>
                            <circle cx={p.x} cy={p.y} r={r} fill={color} />
                            <text
                                x={p.x + 10}
                                y={p.y - 6}
                                fill="#e0e6ff"
                                fontSize="11"
                            >
                                {p.id}
                            </text>
                        </g>
                    );
                })}
            </svg>

            <div
                style={{
                    background: "#161824",
                    border: "1px solid #1e2130",
                    borderRadius: 8,
                    padding: "10px 16px",
                    marginBottom: 16,
                    fontSize: 13,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "6px 24px",
                }}
            >
                <div>
                    <span style={{ color: "#6b7fa3" }}>Schritt: </span>
                    <strong style={{ color: "#ff6b35" }}>
                        {step.stepIndex}
                    </strong>
                </div>

                <div>
                    <span style={{ color: "#6b7fa3" }}>δ: </span>
                    <strong style={{ color: "#ffd700" }}>
                        {step.delta.toFixed(2)}
                    </strong>
                </div>

                <div>
                    <span style={{ color: "#6b7fa3" }}>Aktuell: </span>
                    <strong style={{ color: "#ff6b35" }}>
                        {step.currentPoint?.id} ({step.currentPoint?.x.toFixed(1)},{" "}
                        {step.currentPoint?.y.toFixed(1)})
                    </strong>
                </div>

                <div>
                    <span style={{ color: "#6b7fa3" }}>Bestes Paar: </span>
                    <strong style={{ color: "#ffd700" }}>
                        {step.bestPair?.p0 && step.bestPair?.p1
                            ? `${step.bestPair.p0.id} ↔ ${step.bestPair.p1.id}`
                            : "—"}
                    </strong>
                </div>

                <div
                    style={{
                        gridColumn: "1 / -1",
                        color: "#6b7fa3",
                        marginTop: 2,
                    }}
                >
                    {step.description}
                </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                    onClick={reset}
                    disabled={isAtStart}
                    style={btnStyle(isAtStart)}
                >
                    ⏮ Reset
                </button>

                <button
                    onClick={() => setCurrentStep((s) => s - 1)}
                    disabled={isAtStart}
                    style={btnStyle(isAtStart)}
                >
                    ← Zurück
                </button>

                {isPlaying ? (
                    <button onClick={pause} style={btnStyle(false)}>
                        ⏸ Pause
                    </button>
                ) : (
                    <button
                        onClick={play}
                        disabled={isAtEnd}
                        style={btnStyle(isAtEnd)}
                    >
                        ▶ Play
                    </button>
                )}

                <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={isAtEnd}
                    style={btnStyle(isAtEnd)}
                >
                    Weiter →
                </button>

                <button onClick={props.onChangeInput} style={btnStyle(false)}>
                    Input ändern
                </button>

                <span style={{ color: "#6b7fa3", fontSize: 12, marginLeft: 8 }}>
                    {currentStep + 1} / {props.steps.length}
                </span>
            </div>
        </div>
    );
}

function btnStyle(disabled: boolean): React.CSSProperties {
    return {
        background: disabled ? "#1e2130" : "#232840",
        color: disabled ? "#6b7fa3" : "#e0e6ff",
        border: `1px solid ${disabled ? "#1e2130" : "#3a4a7a"}`,
        borderRadius: 6,
        padding: "6px 14px",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "monospace",
        fontSize: 13,
    };
}