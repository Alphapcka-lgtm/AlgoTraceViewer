import {useMemo, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, RingStyle, OutputProps} from "../shared/Types.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {XNodeWithCords} from "../shared/Nodes.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {getStepIndexFromTimeline, createStepLabels, SWEEP_LINE_PSEUDOCODE} from "../../shared/Utils.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {LegendEntry, XNodeIcon} from "../../LegendeEntry.tsx";

const STEP_DURATION = 0.9;
const PADDING = 1;

export function Output(props: OutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const activeSweepWindowRef = useRef<SVGRectElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);
    const step: AlgorithmStepDTO | undefined = props.steps[props.currentStep];
    const myLabels = useMemo(() => createStepLabels(props.steps.length), [props.steps.length]);  //labels nur neu erzeugen, wenn sich die Anzahl der Steps ändert
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

    const getCandidateRectAttrs = (step: AlgorithmStepDTO) => {
        const searchDelta = step.searchDelta;
        const currentY = step.currentPoint?.y ?? props.height / 2;
        return {
            x: step.sweepLineX - searchDelta,
            y: currentY - searchDelta,
            width: searchDelta,
            height: searchDelta * 2,
        };
    };

    const isShrinkStep = (step: AlgorithmStepDTO): boolean =>
        step.pseudoCodeLineIds.includes("shrink-windows"); //dann das candidate window nicht zeigen

    const shouldShowCandidateWindow = (step: AlgorithmStepDTO): boolean =>
        step.currentPoint !== null && !isShrinkStep(step);

    useGSAP(() => {
        if (!activeSweepWindowRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;
        const activeRect = activeSweepWindowRef.current;
        const candidateRect = candidateSweepWindowRef.current;

        timelineRef.current?.kill();

        // Startzustand der Timeline aus app.
        // Beim normalen Submit (nichts importered) ist props.progress = 0 und bei import ist es der importierte progress...
        const initialProgress: number = props.progress;

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
                    props.setProgress(tl.progress());
                    lastProgressUpdateRef.current = now;
                }
                const stepIndex: number = getStepIndexFromTimeline(tl, myLabels);
                props.setCurrentStep(stepIndex);
            },
            onComplete: () => {
                props.setProgress(1); //nur nur sicherheit ... eigentlich sollte tl.progress() in onUpdate am ende schon 1 liefern
                setIsPlaying(false);
            }
        });

        const firstStep: AlgorithmStepDTO = props.steps[0];

        //init state setzen
        gsap.set(activeRect, {
            attr: getActiveRectAttrs(firstStep),
            opacity: firstStep.currentPoint !== null ? 1 : 0,
        });

        gsap.set(candidateRect, {
            attr: getCandidateRectAttrs(firstStep),
            opacity: shouldShowCandidateWindow(firstStep) ? 1 : 0,
        });

        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //tweens hinzufügen:
        props.steps.slice(1).forEach((step, index) => {
            const stepIndex: number = index + 1;
            const activeRectOpacity: number = step.currentPoint !== null ? 1 : 0;//beim final step die zwei rects ausblenden
            const candidateRectOpacity: number = shouldShowCandidateWindow(step) ? 1 : 0;

            timeline.to(activeRect, {
                attr: getActiveRectAttrs(step),
                opacity: activeRectOpacity,
            });

            timeline.to(candidateRect, {
                attr: getCandidateRectAttrs(step),
                opacity: candidateRectOpacity,
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

    const candidatePointIds = new Set(step.candidatePairs.map((pair) => pair.p0.id));

    const legendenValueActivePoints:string = step.currentPoint === null ? "—" : step.activePoints.length === 0 ? "No active points"
        : step.activePoints.map((p) => p.label).join(", ");

    const legendenValueCandidates:string = step.currentPoint === null ? "—"
            : isShrinkStep(step)
                ? "no candidate comparisons in this step"
                : step.candidatePairs.length === 0
                    ? "No candidates"
                    : step.candidatePairs
                        .map((res) => `dist(${res.p0.label}, ${res.p1.label}) = ${res.distance.toFixed(2)}`)
                        .join("; ");

    //nicht mehr step direkt verwenden ... react setzt nur den startwert dann übernimmt gsap
    // weil sont probleme gibt da react und gsap gleichzeitig dieselben svg attribute kontrollieren....
    const firstStep: AlgorithmStepDTO = props.steps[0];

    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {}}
                canSubmit={false}
            />

            <svg
                className="algorithm-canvas" viewBox={`0 0 ${props.width} ${props.height}`}
                preserveAspectRatio="xMidYMid meet"
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
                    const isCandidate = candidatePointIds.has(p.id);
                    const isActive    = step.activePoints.some((a) => a.id === p.id);
                    const isProcessed = step.processedPoints.some((d) => d.id === p.id);
                    const isBest = p.id === step.bestPair?.p0?.id || p.id === step.bestPair?.p1?.id;
                    const isFuture = step.futurePoints.some((f) => f.id === p.id);

                    //TODO: Nochmal nachdenken ob diese darstellung wirklich gut ist!
                    let fill = "#555";

                    if (isFuture) {
                        fill = "#cccccc";
                    }
                    if (isProcessed) {
                        fill = "#aaaaaa";
                    }
                    if (isCurrent) {
                        fill = "black";
                    }
                    if (isBest) {
                        fill = "#f5c45e";
                    }
                    const scale = isCurrent ? 1.2 : 1;

                    let ringStyle: RingStyle = "none";
                    if (isActive) ringStyle = "active";
                    if (isCandidate) ringStyle = "candidate";

                    return <XNodeWithCords key={p.id} node={p} fill={fill} scale={scale} ringStyle={ringStyle} />;
                })}
            </svg>

            <OutputControls
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


            <div className="step-info">
                <div className="step-description"> {step.description} </div>

                <div className="step-info-grid">
                    <div><strong>Step:</strong> {props.currentStep + 1} / {props.steps.length}</div>
                    <div><strong>Window δ:</strong> {step.searchDelta.toFixed(2)}</div>
                    <LegendEntry
                        label="Current Point: "
                        value={step.currentPoint?.label ?? "—"}
                        icon={<XNodeIcon fill="black" ringStyle="none" scale={1.4}/>}
                    />
                    <div>
                        <LegendEntry
                            label="Best Pair: "
                            value={step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                            icon={<XNodeIcon fill="#f5c45e" ringStyle="none"/>}
                        />
                    </div>
                    <div>
                        <LegendEntry
                            label="Active Point: "
                            value={legendenValueActivePoints}
                            icon={<XNodeIcon fill="#555" ringStyle="active"/>}
                        />
                    </div>

                    <div>
                        <LegendEntry
                            label="Candidates: "
                            value={legendenValueCandidates}
                            icon={<XNodeIcon fill="#555" ringStyle="candidate"/>}
                        />
                    </div>
                    {/*
                    <div>
                        <strong>Candidates:</strong>{" "}
                        {step.currentPoint === null ? "—" :
                            step.candidatePairs.length === 0 ? "No candidates" : step.candidatePairs
                            .map((res) => `dist(${res.p0.label}, ${res.p1.label}) = ${res.distance.toFixed(2)}`)
                            .join("; ")
                        }
                    </div>
                    */}
                </div>
            </div>

            <ImportExportDialog
                onImport={props.onImport}
                createExportString={props.createExportString}
            />

            <PseudoCodePanel
                lines={SWEEP_LINE_PSEUDOCODE}
                activeLineIds={step.pseudoCodeLineIds}
                title={"Sweep Line PseudoCode"}
            />

        </div>
    );
}