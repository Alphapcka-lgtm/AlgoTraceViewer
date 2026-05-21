import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, SVGOutputProps} from "./Types";
import {OutputControl4} from "./OutputControl4";
import {XNode} from "./Nodes.tsx";
import {IOModeTabs} from "./IOModeTabs";
import {getStepIndexFromTimeline, createStepLabels} from "./Utils.tsx";
const STEP_DURATION = 0.9;
const PADDING = 1;

export function SVGOutput4(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());

    const activeSweepWindowRef = useRef<SVGRectElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);

    const step: AlgorithmStepDTO | undefined = props.steps[props.currentStep];

    useGSAP(() => {
        if (!activeSweepWindowRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;

        const activeRect = activeSweepWindowRef.current;
        const candidateRect = candidateSweepWindowRef.current;

        timelineRef.current?.kill();
        const myLabels = createStepLabels(props.steps.length);

        //es wird jetzt der zustand von app gesetzt...
        // Beim normalen Submit (nichts importered) ist props.progress = 0 und props.currentStep = 0
        // und wenn imported wurde, sind das halt die importierten Werte...
        const initialProgress:number = props.progress;
        const initialStep:number = props.currentStep;

        //let lastLabel:string | null = null;
        let lastLabel: string | null = initialStep.toString();

        // timeline erstellen:
        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = timelineRef.current;
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex:number = getStepIndexFromTimeline(tl, myLabels);

                const currentLabel: string = stepIndex.toString();
                if(currentLabel === lastLabel){ // nur wenn sich label ändert currentStep updaten und somit auch nur dann rerendern
                    return;
                }

                lastLabel = currentLabel;
                props.setCurrentStep(stepIndex);

            },
            onComplete: () => {
                props.setProgress(1); //für scrubber ... und auch nur nur sicherheit ... eigentlich sollte tl.progress() in onUpdate am ende schon 1 liefern
                setIsPlaying(false);
            }

        });

        const firstStep: AlgorithmStepDTO = props.steps[0];

        const getCy = (step: AlgorithmStepDTO) =>
            (step.currentPoint?.y ?? props.height / 2) - step.delta;

        //init state setzen
        gsap.set(activeRect, {
            attr: {
                x: firstStep.sweepLineX - firstStep.delta, y: PADDING,
                width: firstStep.delta, height: props.height - 2 * PADDING,
            }
        });

        gsap.set(candidateRect, {
            attr: {
                x: firstStep.sweepLineX - firstStep.delta, y: getCy(firstStep),
                width: firstStep.delta, height: firstStep.delta * 2,
            }
        });
        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //adding tweens:
        props.steps.slice(1).forEach((step, index) => {
            const stepIndex: number = index + 1;

            timeline.to(activeRect, {
                attr: {
                    x: step.sweepLineX - step.delta, y: PADDING,
                    width: step.delta, height: props.height - 2 * PADDING,
                }
            });

            timeline.to(candidateRect, {
                attr: {
                    x: step.sweepLineX - step.delta, y: getCy(step),
                    width: step.delta, height: step.delta * 2,
                }
            }, "<");

            // hier sollte der zustand vom einem step erreicht sein ....
            //alle anderen labels setzen
            timeline.addLabel(myLabels[stepIndex]);
        });

        timelineRef.current = timeline; //store timeline in ref

        //timeline.progress(value, suppressEvents);
        // true verindert während dieses einen progress(...)Aufrufs das timeline callbacks ausgeführt werden (onUpdate...)
        // das ist wichtig beim diesem Initialisieren, weil progress und currentStep schon aus App kommen und onUpdate somit nichts (stepindex) überschreibt
        timeline.progress(initialProgress, true).pause();
        setIsPlaying(false);

        props.setProgress(initialProgress);//eigentlich redundant, weil App diese Werte ja schon gesetzt hat, aber finde es so klarer
        props.setCurrentStep(initialStep);// "

        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true}); //damit eine pausierte leere timeline erzeugt wird... aber eigentlich egal finde es nur schöner so
        };
    }, {
        dependencies: [props.steps],
    });


    if (props.loading) return <p style={{fontFamily: "monospace"}}>Loading...</p>;
    if (props.error) return <p style={{fontFamily: "monospace", color: "red"}}>Error: {props.error}</p>;
    if (!step) return <></>;

    //für rect und line nicht mehr step direkt verwenden ... react setzt nur den startwert dann übernimmt gsap
    // weil sont probleme gibt da react und gsap gleichzeitig dieselben svg attribute kontrollieren....
    const firstStep: AlgorithmStepDTO = props.steps[0];

    return (
        <div>

            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {}}
                canSubmit={false}
            />

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
                    fill="rgba(0, 0, 0, 0.02)"
                    stroke="rgba(0, 0, 0, 0.75)"
                    strokeWidth="2"
                    //strokeDasharray="8 4"
                    rx="2"
                />
                <rect
                    ref={candidateSweepWindowRef}
                    x={firstStep.sweepLineX - firstStep.delta}
                    y={(firstStep.currentPoint?.y ?? props.height / 2) - firstStep.delta}
                    width={firstStep.delta}
                    height={firstStep.delta * 2}
                    fill="rgba(255, 241, 255, 0.75)"
                    stroke="rgba(204, 14, 119, 0.75)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    rx="5"
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
                    fontSize: 15,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4px 16px",
                }}
            >
                <div><strong>Step:</strong> {props.currentStep + 1} / {props.steps.length}</div>
                <div><strong>δ:</strong> {step.delta.toFixed(2)}</div>
                <div><strong>Current Point:</strong> {step.currentPoint?.label}</div>
                <div>
                    <strong> Best Pair:{" "}</strong>
                    {step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                </div>
                <div style={{gridColumn: "1 / -1", color: "#555"}}> {step.description} </div>
            </div>

            <OutputControl4
                timelineRef={timelineRef}
                labels={createStepLabels(props.steps.length)}
                currentStep={props.currentStep}
                setCurrentStep={props.setCurrentStep}
                stepCount={props.steps.length}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.progress}
                setProgress={props.setProgress}
            />

            <div style={{fontFamily: "monospace", fontSize: 15}}>
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