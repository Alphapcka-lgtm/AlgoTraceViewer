import {useMemo, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {AlgorithmStepDTO, Node, RingStyle, OutputProps, RectAttrs, LineAttrs} from "../shared/Types.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {XNodeWithCords} from "../shared/Nodes.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {getStepIndexFromTimeline, createStepLabels, SWEEP_LINE_PSEUDOCODE} from "../../shared/Utils.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {LegendEntry, XNodeIcon} from "../../LegendeEntry.tsx";

const STEP_DURATION = 0.9;
const CANDIDATE_FADE_IN_DURATION = 0.7;
const CANDIDATE_FADE_OUT_DURATION = 0.3;
const CANDIDATE_AUTOPLAY_HOLD_DURATION = 1;
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

    const getActiveAreaAttrs = (step: AlgorithmStepDTO ): RectAttrs => {
        const currentX = step.currentPoint?.x ?? 0;
        const delta = step.windowDelta;
        return {x: currentX - delta, y: PADDING, width: delta, height: props.height - 2 * PADDING};
    };

    const getSweepLineAttrs = (step: AlgorithmStepDTO): LineAttrs=> {
        const currentX = step.currentPoint?.x ?? 0;
        return {x1: currentX, x2: currentX, y1: PADDING, y2: props.height - PADDING};
    };

    const getCandidateRectAttrs = (step: AlgorithmStepDTO) => {
        const currentX = step.currentPoint?.x ?? 0;
        const currentY = step.currentPoint?.y ?? 0; // const currentY = step.currentPoint?.y ?? props.height / 2;

        return {x: currentX - step.windowDelta, y: currentY - step.windowDelta, width: step.windowDelta, height: step.windowDelta * 2};
    };

    const shouldShowCandidateWindow = (step: AlgorithmStepDTO): boolean =>
        step.currentPoint !== null && step.stepType === "CHECK_CANDIDATES";

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
        const showActiveElements = firstStep.currentPoint !== null && firstStep.stepType !== "FINISHED";
        gsap.set(activeArea, {attr: getActiveAreaAttrs(firstStep), opacity: showActiveElements ? 1 : 0});
        gsap.set(sweepLine, {attr: getSweepLineAttrs(firstStep), opacity: showActiveElements ? 1 : 0});
        gsap.set(candidateRect, {
            attr: getCandidateRectAttrs(firstStep),
            opacity: shouldShowCandidateWindow(firstStep) ? 1 : 0,
        });

        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //tweens hinzufügen:
        props.steps.slice(1).forEach((targetStep, index) => {
            const stepIndex = index + 1;

            switch (targetStep.stepType) {
                case "INITIALIZATION": {
                    timeline.to(activeArea, {
                        attr: getActiveAreaAttrs(targetStep), opacity: targetStep.currentPoint ? 1 : 0});
                    timeline.to(sweepLine, {
                        attr: getSweepLineAttrs(targetStep), opacity: targetStep.currentPoint ? 1 : 0}, "<");
                    timeline.to(candidateRect, {
                        attr: getCandidateRectAttrs(targetStep), opacity: 0}, "<");
                    break;
                }

                case "ADVANCE_AND_PRUNE": {
                    // altes Candidate Window ausblenden
                    timeline.to(candidateRect, {opacity: 0, duration: CANDIDATE_FADE_OUT_DURATION});
                    //Sweep Line und Active Window zum neuen current point bewegen
                    timeline.to(activeArea, {attr: getActiveAreaAttrs(targetStep), opacity: 1});
                    timeline.to(sweepLine, {attr: getSweepLineAttrs(targetStep), opacity: 1}, "<");
                    // damit die animation einblenden besser aussieht, fährt es unsichtbar mit und so muss es bei CHECK_CANDIDATES nicht mehr bewegt werden
                    timeline.to(candidateRect, {attr: getCandidateRectAttrs(targetStep), opacity: 0}, "<");
                    break;
                }

                case "CHECK_CANDIDATES": {
                    //Candidate Window einblenden.
                    timeline.to(candidateRect, {opacity: 1, duration: CANDIDATE_FADE_IN_DURATION, ease: "power1.inOut"});
                    break;
                }

                case "COMMIT_ITERATION": {
                    // Candidate Window wieder ausblenden
                    timeline.to(candidateRect, {opacity: 0, duration: CANDIDATE_FADE_OUT_DURATION});

                    timeline.to({}, {duration: 0.25}); //kleine pause, damit man beides besser wahrnehmen kann ...

                    //Falls kleineres δ gefunden wurde, schrumpft das Active Window
                    //timeline.to(activeArea, {attr: getActiveAreaAttrs(targetStep), opacity: 1});
                    timeline.to(activeArea, {
                        attr: getActiveAreaAttrs(targetStep), opacity: 1, duration: 0.75, ease: "back.out(1.2)"});

                    //Normalerweise bleibt pos gleich ... zur sicherheit trotzdem stezten
                    timeline.to(sweepLine, {attr: getSweepLineAttrs(targetStep), opacity: 1}, "<");
                    break;
                }

                case "FINISHED": {
                    timeline.to([activeArea, sweepLine, candidateRect], {opacity: 0});
                    break;
                }
            }

            timeline.addLabel(myLabels[stepIndex]); //Hier ist "Zielzustand" des Snapshots  erreicht.

            // Damit man das candidaten window im Autoplay beim CHECK_CANDIDATES etwas länger sieht.
            if (targetStep.stepType === "CHECK_CANDIDATES") {
                timeline.to(candidateRect, {opacity: 1, duration: CANDIDATE_AUTOPLAY_HOLD_DURATION, ease: "none"});
            }
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

    const candidatePointIds = new Set(
        step.stepType === "CHECK_CANDIDATES" ? step.candidateComparisons.map(comparison => comparison.candidate.id) : []
    );

    const activePointsLegendValue:string = step.currentPoint === null ? "—" : step.activePoints.length === 0 ? "No active points"
        : step.activePoints.map((p) => p.label).join(", ");

    const getCandidateLegendValue = (step: AlgorithmStepDTO): string => {
        if (step.currentPoint === null) return "—";
        if (step.stepType !== "CHECK_CANDIDATES") return "Not part of this step";
        if (step.candidateComparisons.length === 0) return "No candidates inside the candidate window";
        return step.candidateComparisons.map(({candidate, distance}) =>
                `dist(${step.currentPoint!.label}, ${candidate.label}) = ${distance.toFixed(2)}`
            ).join(", ");
    };

    //nicht mehr step direkt verwenden ... react setzt nur den startwert dann übernimmt gsap
    // weil sont probleme gibt da react und gsap gleichzeitig dieselben svg attribute kontrollieren....
    const firstStep: AlgorithmStepDTO = props.steps[0];
    const currentX = firstStep.currentPoint?.x ?? 0;
    const currentY = firstStep.currentPoint?.y ?? props.height / 2;
    const delta = firstStep.windowDelta;

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

                {props.steps[0].allPoints.map((p: Node) => { //step.allPoints.map()
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
                    if (isBest) {
                        fill = "#f5c45e";
                    }
                    if (isCurrent) {
                        fill = "black";
                    }
                    const scale = isCurrent ? 1.2 : 1;

                    let ringStyle: RingStyle = "none";
                    if (isActive) ringStyle = "active";
                    if (isCandidate) ringStyle = "candidate";

                    return <XNodeWithCords key={p.id} node={p} fill={fill} scale={scale} ringStyle={ringStyle} />;
                })}

                {step.stepType === "CHECK_CANDIDATES" &&
                    step.currentPoint && step.candidateComparisons.map(({candidate}) => (
                        <line
                            key={`${step.currentPoint!.id}-${candidate.id}`}
                            className="candidate-comparison-line"
                            x1={step.currentPoint!.x}
                            y1={step.currentPoint!.y}
                            x2={candidate.x}
                            y2={candidate.y}
                            pointerEvents="none"
                        />
                    ))
                }
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
                    <div><strong>Window δ:</strong> {step.windowDelta.toFixed(2)}</div>
                    <div>
                        <strong>Closest pair Distance δ:</strong>{" "}
                        {step.bestPair?.distance.toFixed(2) ?? "—"}
                    </div>
                    <LegendEntry
                        label="Current Point: "
                        value={step.currentPoint?.label ?? "—"}
                        icon={<XNodeIcon fill="black" ringStyle="none" scale={1.4}/>}
                    />
                    <div>
                        <LegendEntry
                            label="Closest pair: "
                            value={step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                            icon={<XNodeIcon fill="#f5c45e" ringStyle="none"/>}
                        />
                    </div>
                    <div>
                        <LegendEntry
                            label="Active Points: "
                            value={activePointsLegendValue}
                            icon={<XNodeIcon fill="#555" ringStyle="active"/>}
                        />
                    </div>

                    <div>
                        <LegendEntry
                            label="Candidate comparisons: "
                            value={getCandidateLegendValue(step)}
                            icon={<XNodeIcon fill="#555" ringStyle="candidate"/>}
                        />
                    </div>
                </div>
            </div>

            <PseudoCodePanel
                lines={SWEEP_LINE_PSEUDOCODE}
                activeLineIds={step.pseudoCodeLineIds}
                title={"Sweep Line PseudoCode"}
            />

            <ImportExportDialog
                onImport={props.onImport}
                createExportString={props.createExportString}
            />

        </div>
    );
}