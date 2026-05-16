import {useEffect, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, SVGOutputProps} from "./Types";
import {OutputControl2} from "./OutputControl2";
import {XNode} from "./Nodes.tsx";
import {btnStyle} from "./Utils.tsx";

const STEP_DURATION = 0.9;
const PADDING = 1;

export function SVGOutput3(props: SVGOutputProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const activeSweepWindowRef = useRef<SVGRectElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);

    const step: AlgorithmStepDTO | undefined = props.steps[currentStep];

    const isAtEnd = currentStep >= props.steps.length - 1;
    const actuallyPlaying = isPlaying && !isAtEnd;

    useGSAP(() => {
        if (!step || !activeSweepWindowRef.current || !candidateSweepWindowRef.current) return;

        const x = step.sweepLineX;
        const delta = step.delta;
        const cy = step.currentPoint?.y ?? props.height / 2;

        //Wenn man schnell auf Next/Back klickt kann noch eine alte Animation laufen.... die killen
        gsap.killTweensOf([activeSweepWindowRef.current, candidateSweepWindowRef.current]);

        gsap.to(activeSweepWindowRef.current, {
            attr: {
                x: x - delta,
                y: PADDING,
                width: delta,
                height: props.height - 2 * PADDING, //2 * PADDING damit nach oben und nach unten padding ist...
            },
            duration: STEP_DURATION,
            ease: "power2.inOut",
            //overwrite: "auto"
        });

        gsap.to(candidateSweepWindowRef.current, {
            attr: {
                x: x - delta,
                y: cy - delta,
                width: delta,
                height: delta * 2,
            },
            duration: STEP_DURATION,
            ease: "power2.inOut",
            //overwrite: "auto"
        });
    }, {dependencies: [currentStep]});

    //"Taktgeber" für Autoplay...
    //wenn play aktiv ist wartet der Effekt so lange, bis die aktuelle gsapAnimation fertig ist + bisschen länger
    // und erst dann wird currentStep um 1 erhöt .
    useEffect(() => {
        if (!actuallyPlaying) return;

        const goToNextStep = () => {
            setCurrentStep((prev) => prev + 1);
        };

        const timeoutDuration: number = (STEP_DURATION + 0.2) * 1000;
        //const timeoutId:number = setTimeout(goToNextStep, timeoutDuration);
        const timeoutId: ReturnType<typeof setTimeout> = setTimeout(goToNextStep, timeoutDuration);

        return () => {
            clearTimeout(timeoutId);
        };

    }, [actuallyPlaying, currentStep]);

    if (props.loading) return <p style={{fontFamily: "monospace"}}>Loading...</p>;
    if (props.error) return <p style={{fontFamily: "monospace", color: "red"}}>Error: {props.error}</p>;
    if (!step) return <></>;

    //für rect und line nicht mehr step direkt verwenden ... react setzt nur den startwert dann übernimmt gsap
    // weil sont probleme gibt da react und gsap gleichzeitig dieselben svg attribute kontrollieren....
    const firstStep: AlgorithmStepDTO = props.steps[0];

    return (
        <div style={{display: "flex", flexDirection: "column", gap: 8, marginTop: "20px"}}>

            <button
                onClick={props.onChangeInput}
                style={{...btnStyle, width: "50%"}}
            >
                ← Change input
            </button>

            <svg
                width={props.width}
                height={props.height}
                style={{border: "2px solid black", borderRadius: "15px"}}
                viewBox={`0 0 ${props.width} ${props.height}`}
            >
                <rect
                    ref={activeSweepWindowRef}
                    x={firstStep.sweepLineX - firstStep.delta}
                    y={PADDING}
                    width={firstStep.delta}
                    height={props.height - 2 * PADDING}
                    fill="rgba(0, 229, 255, 0.05)"
                    stroke="rgba(0, 229, 255, 0.25)"
                    strokeWidth="1.5"
                    //strokeDasharray="8 4"
                />
                <rect
                    ref={candidateSweepWindowRef}
                    x={firstStep.sweepLineX - firstStep.delta}
                    y={(firstStep.currentPoint?.y ?? props.height / 2) - firstStep.delta}
                    width={firstStep.delta}
                    height={firstStep.delta * 2}
                    fill="rgba(255,107,53,0.08)"
                    stroke="rgba(255,107,53,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                />


                {step.allPoints.map((p: Node) => {
                    const isCurrent: boolean = p.id === step.currentPoint?.id;
                    const isActive: boolean = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed: boolean = step.processedPoints.some((d) => d.id === p.id);
                    const isBest: boolean = p.id === step.bestPair?.p0?.id || p.id === step.bestPair?.p1?.id;

                    const fill =
                        isCurrent ? "#ff6b35" : isBest ? "#ffd700" : isActive ? "#00e5ff" : isProcessed ? "#888" : "#4a9eff";

                    return (<XNode key={p.id} node={p} fill={fill}/>);
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
                <div><strong>Step:</strong> {currentStep + 1} / {props.steps.length}</div>
                <div><strong>δ:</strong> {step.delta.toFixed(2)}</div>
                <div><strong>Current Point:</strong> {step.currentPoint?.label}</div>
                <div>
                    <strong> Best Pair:{" "}</strong>
                    {step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                </div>
                <div style={{gridColumn: "1 / -1", color: "#555"}}> {step.description} </div>
            </div>

            <OutputControl2
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                stepCount={props.steps.length}
                isPlaying={actuallyPlaying}
                setIsPlaying={setIsPlaying}
            />

            <div style={{fontFamily: "monospace", fontSize: 13}}>
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