import {useMemo, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, SVGOutputProps} from "./Types";
import {OutputControl4} from "./OutputControl4";
import {XNode} from "./Nodes.tsx";
import {IOModeTabs} from "./IOModeTabs";
import {getStepIndexFromTimeline, createStepLabels, SWEEP_LINE_PSEUDOCODE} from "./Utils.tsx";
import {ImportExportDialog} from "./ImportExportDialog.tsx";
import {PseudoCodePanel} from "./PseudoCodePanel";

const STEP_DURATION = 0.9;
const PADDING = 1;

export function SVGOutput4(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());

    const activeSweepWindowRef = useRef<SVGRectElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);

    const step: AlgorithmStepDTO | undefined = props.steps[props.currentStep];
    //labels nur neu erzeugen, wenn sich die Anzahl der Steps ändert
    const myLabels = useMemo(() => createStepLabels(props.steps.length), [props.steps.length]);

    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const lastProgressUpdateRef = useRef(0); //um setProgress zu throttlen

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    const getActiveRectAttrs = (step: AlgorithmStepDTO) => {
        const searchDelta = step.searchDelta;

        return {
            x: step.sweepLineX - searchDelta,
            y: PADDING,
            width: searchDelta,
            height: props.height - 2 * PADDING
        };
    };

    const getCy = (step: AlgorithmStepDTO) =>
        (step.currentPoint?.y ?? props.height / 2) - step.searchDelta;

    const getCandidateRectAttrs = (step: AlgorithmStepDTO) => {
        const searchDelta = step.searchDelta;
        return {
            x: step.sweepLineX - searchDelta,
            y: getCy(step),
            width: searchDelta,
            height: searchDelta * 2
        };
    };


    useGSAP(() => {
        if (!activeSweepWindowRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;

        const activeRect = activeSweepWindowRef.current;
        const candidateRect = candidateSweepWindowRef.current;

        timelineRef.current?.kill();

        // Startzustand der Timeline aus app.
        // Beim normalen Submit (nichts importered) ist props.progress = 0
        // und wenn imported wurde, sind das halt die importierten Fortschritt...
        const initialProgress: number = props.progress;

        // timeline erstellen:
        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = timelineRef.current;

                const now = performance.now();
                if (now - lastProgressUpdateRef.current > 100) { // setProgress throttlen, sonst kann man playback speed nicht mehr während auotplay ändern
                    props.setProgress(tl.progress()); //für scrubber
                    lastProgressUpdateRef.current = now;
                }
                const stepIndex: number = getStepIndexFromTimeline(tl, myLabels);
                props.setCurrentStep(stepIndex);

            },
            onComplete: () => {
                props.setProgress(1); //für scrubber ... und auch nur nur sicherheit ... eigentlich sollte tl.progress() in onUpdate am ende schon 1 liefern
                setIsPlaying(false);
            }

        });

        const firstStep: AlgorithmStepDTO = props.steps[0];

        //init state setzen
        gsap.set(activeRect, {
            attr: getActiveRectAttrs(firstStep)
        });

        gsap.set(candidateRect, {
            attr: getCandidateRectAttrs(firstStep)
        });

        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //adding tweens:
        props.steps.slice(1).forEach((step, index) => {
            const stepIndex: number = index + 1;
            const rectOpacity: number = step.currentPoint !== null ? 1 : 0; //beim final step die zwei rects ausblenden

            timeline.to(activeRect, {
                attr: getActiveRectAttrs(step),
                opacity: rectOpacity,
            });

            timeline.to(candidateRect, {
                attr: getCandidateRectAttrs(step),
                opacity: rectOpacity,
            }, "<");

            // hier sollte der zustand vom einem step erreicht sein .... alle anderen labels setzen
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

    if (props.loading) return <p style={{fontFamily: "monospace"}}>Loading...</p>;
    if (props.error) return <p style={{fontFamily: "monospace", color: "red"}}>Error: {props.error}</p>;
    if (!step) return <></>;

    //const candidatePointIds = new Set(step.candidatePairs.flatMap((pair) => [pair.p0.id, pair.p1.id]));
    //const candidatePointIds = new Set(step.candidatePairs.map((pair) => pair.p0.id)); //da current eh schon andres eingefärbt wird

    //für rect und line nicht mehr step direkt verwenden ... react setzt nur den startwert dann übernimmt gsap
    // weil sont probleme gibt da react und gsap gleichzeitig dieselben svg attribute kontrollieren....
    const firstStep: AlgorithmStepDTO = props.steps[0];

    return (
        <div>

            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {
                }}
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
                    x={firstStep.sweepLineX - firstStep.searchDelta}
                    y={PADDING}
                    width={firstStep.searchDelta}
                    height={props.height - 2 * PADDING}
                    fill="rgba(0, 0, 0, 0.02)"
                    stroke="rgba(0, 0, 0, 0.75)"
                    strokeWidth="2"
                    //strokeDasharray="8 4"
                    rx="2"
                />
                <rect
                    ref={candidateSweepWindowRef}
                    x={firstStep.sweepLineX - firstStep.searchDelta}
                    y={(firstStep.currentPoint?.y ?? props.height / 2) - firstStep.searchDelta}
                    width={firstStep.searchDelta}
                    height={firstStep.searchDelta * 2}
                    fill="rgba(255, 241, 255, 0.75)"
                    stroke="rgba(204, 14, 119, 0.75)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    rx="5"
                />


                {step.allPoints.map((p: Node) => {
                    const isCurrent = step.currentPoint !== null && p.id === step.currentPoint.id;
                    //const isCandidate = candidatePointIds.has(p.id);
                    //const isActive    = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed = step.processedPoints.some((d) => d.id === p.id);
                    const isBest = p.id === step.bestPair?.p0?.id || p.id === step.bestPair?.p1?.id;
                    const isFuture = step.futurePoints.some((f) => f.id === p.id);

                    //TODO: Nochmal nachdenken ob diese darstellung wirklich gut ist!
                    let fill = "black";

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

                    return <XNode key={p.id} node={p} fill={fill}/>;
                })}


            </svg>

            <OutputControl4
                timelineRef={timelineRef}
                labels={myLabels}
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
                    <div><strong>Current Point:</strong> {step.currentPoint?.label ?? "-"}</div>
                    <div>
                        <strong> Best Pair:{" "}</strong>
                        {step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                    </div>
                    <div>
                        <strong>Active Points:</strong>{" "}
                        {step.currentPoint === null ? "—" : step.activePoints.length === 0 ? "No active points"
                            : step.activePoints.map((p) => p.label).join(", ")}
                    </div>

                    <div>
                        <strong>Candidates:</strong>{" "}
                        {step.currentPoint === null ? "—" : step.candidatePairs.length === 0 ? "No candidates" : step.candidatePairs
                            .map((res) => `dist(${res.p0.label}, ${res.p1.label}) = ${res.distance.toFixed(2)}`)
                            .join("; ")
                        }
                    </div>
                    {/*
                        <div>
                        <strong>Future Points:</strong>
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

            <PseudoCodePanel
                lines={SWEEP_LINE_PSEUDOCODE}
                activeLineIds={step.pseudoCodeLineIds}
            />
        </div>
    );
}