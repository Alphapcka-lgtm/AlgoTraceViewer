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
    const activeSweepAreaRef = useRef<SVGRectElement>(null);
    const sweepLineRef = useRef<SVGLineElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);
    const step: AlgorithmStepDTO | undefined = props.steps[props.currentStep];
    const myLabels = useMemo(() => createStepLabels(props.steps.length), [props.steps.length]);  //labels nur neu erzeugen, wenn sich die Anzahl der Steps ändert
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const lastProgressUpdateRef = useRef(0); //um setProgress zu throttlen

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    const getActiveAreaAttrs = (step: AlgorithmStepDTO) => {
        const delta = step.deltaBeforeCandidateCheck;
        const currentX = step.currentPoint?.x ?? 0;

        return {
            x: currentX - delta, y: PADDING, width: delta, height: props.height - 2 * PADDING
        };
    };

    const getSweepLineAttrs = (step: AlgorithmStepDTO) => {
        const currentX = step.currentPoint?.x ?? 0;
        return {
            x1: currentX, x2: currentX, y1: PADDING, y2: props.height - PADDING};
    };

    const getCandidateRectAttrs = (step: AlgorithmStepDTO) => {
        const delta = step.deltaBeforeCandidateCheck;
        const currentX = step.currentPoint?.x ?? 0;
        const currentY = step.currentPoint?.y ?? 0; // const currentY = step.currentPoint?.y ?? props.height / 2;

        return {
            x: currentX - delta, y: currentY - delta, width: delta, height: delta * 2
        };
    };

    const isShrinkStep = (step: AlgorithmStepDTO): boolean =>
        step.pseudoCodeLineIds.includes("shrink-windows"); //dann das candidate window nicht zeigen

    const shouldShowCandidateWindow = (step: AlgorithmStepDTO): boolean =>
        step.currentPoint !== null && !isShrinkStep(step);

    useGSAP(() => {
        if (!activeSweepAreaRef.current || !sweepLineRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;
        const activeArea = activeSweepAreaRef.current;
        const sweepLine = sweepLineRef.current;
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
        const activeElementsOpacity = firstStep.currentPoint !== null ? 1 : 0;
        gsap.set(activeArea, {attr: getActiveAreaAttrs(firstStep), opacity: activeElementsOpacity});
        gsap.set(sweepLine, {attr: getSweepLineAttrs(firstStep), opacity: activeElementsOpacity});

        gsap.set(candidateRect, {
            attr: getCandidateRectAttrs(firstStep),
            opacity: shouldShowCandidateWindow(firstStep) ? 1 : 0,
        });

        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //tweens hinzufügen:
        props.steps.slice(1).forEach((step, index) => {
            const stepIndex: number = index + 1;

            if (step.currentPoint === null) {
                //beim final step die zwei rects ausblenden
                timeline.to([activeArea, sweepLine, candidateRect], {opacity: 0,});
            } else {
                timeline.to(activeArea, {attr: getActiveAreaAttrs(step), opacity: 1});
                timeline.to(sweepLine, {attr: getSweepLineAttrs(step), opacity: 1}, "<");
                timeline.to(candidateRect, {
                    attr: getCandidateRectAttrs(step), opacity: shouldShowCandidateWindow(step) ? 1 : 0
                    }, "<"
                );
            }
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
    const currentX = firstStep.currentPoint?.x ?? 0;
    const currentY = firstStep.currentPoint?.y ?? props.height / 2;
    const delta = firstStep.deltaBeforeCandidateCheck;


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
                    ref={activeSweepAreaRef}
                    x={currentX - delta}
                    y={PADDING}
                    width={delta}
                    height={props.height - 2 * PADDING}
                    fill="rgba(90, 90, 90, 0.14)"
                    stroke="none"
                    opacity={0}
                    pointerEvents="none"
                    rx={2}
                />
                <rect
                    ref={candidateSweepWindowRef}
                    x={currentX - delta}
                    y={currentY - delta}
                    width={delta}
                    height={delta * 2}
                    fill="rgba(255,220,245,0.75)"
                    stroke="rgb(204,14,119)"
                    strokeWidth={0.6}
                    strokeDasharray="6 3"
                    rx={2}
                    opacity={0}
                    pointerEvents="none"
                />
                <line
                    ref={sweepLineRef}
                    x1={currentX}
                    x2={currentX}
                    y1={PADDING}
                    y2={props.height - PADDING}
                    stroke="rgba(0, 0, 0, 0.9)"
                    strokeWidth={2}
                    opacity={0}
                    pointerEvents="none"
                    strokeLinecap="round"
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
                    <div><strong>Window δ:</strong> {step.deltaBeforeCandidateCheck.toFixed(2)}</div>
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