import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, SVGOutputProps} from "./Types";
import {OutputControl} from "./OutputControl";
import {XNode} from "./Nodes.tsx";
import {btnStyle} from "./Utils.tsx";

const STEP_DURATION = 0.9; // Dauer eines einzelnen step tweens in sek
const PADDING = 30;

export function SVGOutput2(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    // die persistente Timeline
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline({paused: true}));

    const sweepLineRef = useRef<SVGLineElement>(null);
    const sweepRectRef = useRef<SVGRectElement>(null);

    // Container scope für useGSAP
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

    useGSAP(
        () => {
            if (!props.steps || props.steps.length === 0) return;
            if (!sweepLineRef.current || !sweepRectRef.current) return;

            // Neue Timeline
            tlRef.current = gsap.timeline({
                paused: true,
                // onUpdate hält den Scrubber-State synchron
                onUpdate: () => setProgress(tlRef.current.progress()),
                onComplete: () => setIsPlaying(false),
            });

            // Startzustand ...
            const firstStep = props.steps[0];
            const firstX = firstStep.sweepLineX;
            const firstCy = firstStep.currentPoint?.y ?? props.height / 2;
            const firstDelta = firstStep.delta;

            gsap.set(sweepLineRef.current, {
                attr: {x1: firstX, x2: firstX},
            });
            gsap.set(sweepRectRef.current, {
                attr: {
                    x: firstX - firstDelta,
                    y: firstCy - firstDelta,
                    width: firstDelta,
                    height: firstDelta * 2,
                },
            });

            // Pro Schritt: Label setzen + Tweens anhängen
            tlRef.current.addLabel("step-0", 0);

            props.steps.slice(1).forEach((step: AlgorithmStepDTO, index: number) => {
                const realIndex = index + 1;

                const x = step.sweepLineX;
                const delta = step.delta;
                const cy = step.currentPoint?.y ?? props.height / 2;

                tlRef.current.to(sweepLineRef.current!, {
                    attr: { x1: x, x2: x },
                    duration: STEP_DURATION,
                    ease: "power2.inOut",
                });

                tlRef.current.to(
                    sweepRectRef.current!,
                    {
                        attr: {
                            x: x - delta,
                            y: cy - delta,
                            width: delta,
                            height: delta * 2,
                        },
                        duration: STEP_DURATION,
                        ease: "power2.inOut",
                    },
                    "<"
                );

                tlRef.current.addLabel(`step-${realIndex}`);
            });

            // Fortschritt aus vorherigem Render wiederherstellen
            //tlRef.current.progress(progress);
            tlRef.current.pause(0);
            setProgress(0);
            setActiveStepIndex(0);
            setIsPlaying(false);
        },
        // revertOnUpdate: true ... GSAP macht alle Änderungen rückgängig bevor neu gebaut wird
        {scope: containerRef, dependencies: [props.steps], revertOnUpdate: true}
    );



    const activeStep: AlgorithmStepDTO | undefined = props.steps[activeStepIndex];

    if (props.loading) return <p style={{fontFamily: "monospace"}}>Loading...</p>;
    if (props.error) return <p style={{fontFamily: "monospace", color: "red"}}>Error: {props.error}</p>;
    if (!activeStep) return <></>;

    return (
        <div ref={containerRef} style={{display: "flex", flexDirection: "column", gap: 8, marginTop: "20px"}}>

            <button
                onClick={props.onChangeInput}
                style={{...btnStyle, width: "50%"}}
            > ← Change input
            </button>

            <svg
                width={props.width}
                height={props.height}
                style={{border: "2px solid black", borderRadius: "30px"}}
                viewBox={`0 0 ${props.width} ${props.height}`}
            >
                <rect
                    ref={sweepRectRef}
                    x={activeStep.sweepLineX - activeStep.delta}
                    y={(activeStep.currentPoint?.y ?? props.height / 2) - activeStep.delta}
                    width={activeStep.delta}
                    height={activeStep.delta * 2}
                    fill="rgba(255,107,53,0.08)"
                    stroke="rgba(255,107,53,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                />

                <line
                    ref={sweepLineRef}
                    x1={activeStep.sweepLineX} y1={PADDING}
                    x2={activeStep.sweepLineX} y2={props.height - PADDING}
                    stroke="#ff6b35"
                    strokeWidth="2"
                />

                {/* Nodes/Points */}
                {activeStep.allPoints.map((p: Node) => {
                    const isCurrent = p.id === activeStep.currentPoint?.id;
                    const isActive = activeStep.activePoints.some((a) => a.id === p.id);
                    const isProcessed = activeStep.processedPoints.some((d) => d.id === p.id);
                    const isBest = p.id === activeStep.bestPair?.p0?.id || p.id === activeStep.bestPair?.p1?.id;

                    const fill = isCurrent ? "#ff6b35" : isBest ? "#ffd700" : isActive ? "#00e5ff" : isProcessed ? "#888" : "#4a9eff";

                    return (
                        <XNode key={p.id} node={p} fill={fill}/>
                    );
                })}
            </svg>

            {/*info panel*/}
            <div style={{
                fontFamily: "monospace",
                fontSize: 13,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px 16px"
            }}>
                <div>Step: <strong>{activeStepIndex + 1} / {props.steps.length}</strong></div>
                <div>δ: <strong>{activeStep.delta.toFixed(2)}</strong></div>
                <div>Current Point: <strong>{activeStep.currentPoint?.label}</strong></div>
                <div>Best
                    Pair: <strong>{activeStep.bestPair ? `${activeStep.bestPair.p0.label} ↔ ${activeStep.bestPair.p1.label}` : "—"}</strong>
                </div>
                <div style={{gridColumn: "1 / -1", color: "#555"}}>{activeStep.description}</div>
            </div>

            <OutputControl
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={progress}
                setProgress={setProgress}
                activeStepIndex={activeStepIndex}
                setActiveStepIndex={setActiveStepIndex}
                stepCount={props.steps.length}
                tlRef={tlRef}
            />

            <div style={{fontFamily: "monospace", fontSize: 13}}>
                <div>
                    <strong>Active Points:</strong>{" "}
                    {activeStep.activePoints.length === 0
                        ? "No active points"
                        : activeStep.activePoints
                            .map((p) => p.label)
                            .join(", ")
                    }
                </div>
                <div>
                    <strong>Candidates:</strong>{" "}
                    {activeStep.candidatePairs.length === 0
                        ? "No candidates in this step"
                        : activeStep.candidatePairs
                            .map(
                                (res) =>
                                    `dist(${res.p0.label}, ${res.p1.label}) = ${res.distance.toFixed(2)}`
                            )
                            .join("; ")
                    }
                </div>
            </div>



        </div>
    );
}
