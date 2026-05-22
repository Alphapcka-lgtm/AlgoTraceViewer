import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, SVGOutputProps} from "./Types";
import {OutputControl4} from "./OutputControl4";
import {XNode} from "./Nodes.tsx";
import {IOModeTabs} from "./IOModeTabs";
import {getStepIndexFromTimeline, createStepLabels} from "./Utils.tsx";
import {ImportExportDialog} from "./ImportExportDialog.tsx";

const STEP_DURATION = 0.9;
const PADDING = 1;

export function SVGOutput4(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());

    const activeSweepWindowRef = useRef<SVGRectElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);

    const step: AlgorithmStepDTO | undefined = props.steps[props.currentStep];

    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    useGSAP(() => {
        if (!activeSweepWindowRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;

        const activeRect = activeSweepWindowRef.current;
        const candidateRect = candidateSweepWindowRef.current;

        timelineRef.current?.kill();
        const myLabels = createStepLabels(props.steps.length);

        // Startzustand der Timeline aus app.
        // Beim normalen Submit (nichts importered) ist props.progress = 0
        // und wenn imported wurde, sind das halt die importierten Fortschritt...
        const initialProgress:number = props.progress;

        let lastLabel:string | null = null;

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

        // Setzt die gerade gebaute Timeline auf den richtigen (0 oder den vom import) progress.
        //in onUpdate wird dann aus progress der richitge currentStep berechnet
        timeline.progress(initialProgress).pause();
        timeline.timeScale(playbackSpeed); //hat keine auswirkung auf progress ... timeScale verändert nur wie schnell Timeline abgespielt wird
        setIsPlaying(false);

        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true}); //damit eine pausierte leere timeline erzeugt wird... aber eigentlich egal finde es nur schöner so
        };
    }, {
        dependencies: [props.steps],
    });

    //const candidatePointIds = new Set(step.candidatePairs.flatMap((pair) => [pair.p0.id, pair.p1.id]));
    //const candidatePointIds = new Set(step.candidatePairs.map((pair) => pair.p0.id)); //da current eh schon andres eingefärbt wird

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
                    const isCurrent   = step.currentPoint !== null && p.id === step.currentPoint.id;
                    //const isCandidate = candidatePointIds.has(p.id);
                    //const isActive    = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed = step.processedPoints.some((d) => d.id === p.id);
                    const isBest      = p.id === step.bestPair?.p0?.id || p.id === step.bestPair?.p1?.id;
                    const isFuture    = step.futurePoints.some((f) => f.id === p.id);

                    let fill = "#4a9eff";

                    if (isCurrent) {
                        fill = "#BE3D2A";
                    } else if (isBest) {
                        fill = "#ffd700";
                    }
                    /*
                    else if(isCandidate){
                        fill = "#a855f7";  // im kleinen fenster
                    }  else if (isActive){
                        fill = "#4a9eff";  //im großen Fenster
                    }
                     */
                    else if (isProcessed) {

                        fill = "#aaaaaa"; // abgearbeitet
                    } else if (isFuture) {
                        fill = "#cccccc";//noch nicht betrachtet
                    }

                    return <XNode key={p.id} node={p} fill={fill} />;
                })}



            </svg>

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

                playbackSpeed={playbackSpeed}
                onPlaybackSpeedChange={changePlaybackSpeed}
            />
            <div style={{fontFamily: "monospace", fontSize: 15,}}>
                <div style={{gridColumn: "1 / -1", color: "#555"}}> {step.description} </div>

                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px 16px"}}>
                    <div><strong>Step:</strong> {props.currentStep + 1} / {props.steps.length}</div>
                    <div><strong>δ:</strong> {step.delta.toFixed(2)}</div>
                    <div><strong>Current Point:</strong> {step.currentPoint?.label}</div>
                    <div>
                        <strong> Best Pair:{" "}</strong>
                        {step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                    </div>
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
                    {/*
                    <div>
                        <strong>Future Points:</strong>{" "}
                        {step.futurePoints.length === 0 ? "—"
                            : step.futurePoints.map((p) => p.label).join(", ")}
                    </div>

                    */}

                </div>

            </div>

            <ImportExportDialog
                mode="output"
                createExportString={props.createExportString}
            />
        </div>
    );
}