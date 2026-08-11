import {useCallback, useMemo, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import type {
    AlgorithmStepDTO, Point, OutputProps, RectAttrs, LineAttrs, PointVisualRefs, PointVisualState
} from "../shared/Types.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {XPointWithCords} from "../shared/Points.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {
    getStepIndexFromTimeline,
    createStepLabels,
    SWEEP_LINE_PSEUDOCODE,
    getActivePseudoCodeLineIds, isSamePair
} from "../../shared/Utils.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {LegendEntry, XPointIcon} from "../../LegendeEntry.tsx";

const STEP_DURATION = 0.8;
const CANDIDATE_FADE_IN_DURATION = 0.45;
const CANDIDATE_FADE_OUT_DURATION = 0.25;
const CANDIDATE_AUTOPLAY_HOLD_DURATION = 0.8;
const ACTIVE_WINDOW_SHRINK_DURATION = 0.7;

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

    const activeSweepAreaDifferenceRef = useRef<SVGRectElement>(null);
    const pointRefsMap = useRef(new Map<string, PointVisualRefs>());
    const closestPairLineRef = useRef<SVGLineElement>(null);

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

    const hasCurrentDisplayed = (step: AlgorithmStepDTO): boolean =>
        step.currentPoint !== null && step.stepType !== "START" && step.stepType !== "INITIALIZATION" && step.stepType !== "FINISHED";

    const getPointVisualState = (step: AlgorithmStepDTO, pointId: string): PointVisualState => {
        const isCurrent = hasCurrentDisplayed(step) && step.currentPoint?.id === pointId;
        const isCandidate = step.stepType === "CHECK_CANDIDATES" &&
            step.candidateComparisons.some(({candidate}) => candidate.id === pointId);
        const isActive = step.activePoints.some(point => point.id === pointId);
        const isBest = step.bestPair?.p0.id === pointId ||step.bestPair?.p1.id === pointId;
        const isProcessed = step.processedPoints.some(point => point.id === pointId);
        const isFuture = step.futurePoints.some(point => point.id === pointId);
        return {isCurrent, isCandidate, isActive, isBest, isProcessed, isFuture};
    };

    const getPointColor = (state: PointVisualState): string => {
        if (state.isBest) return "#0000CD";//"#0000CD"; //"#f5c45e";00008B
        if (state.isProcessed) return "#cccccc";
        if (state.isFuture) return "#808080";
        return "#222222";//"#555";
    };

    const registerPointRefsInMap = useCallback((pointId: string, refs: PointVisualRefs | null) => {
            if (refs) {
                pointRefsMap.current.set(pointId, refs);
            } else { //wenn point aus DOM unmounted wird, dann aus map entfernen
                pointRefsMap.current.delete(pointId);   // um zu verhindert, dass die map irgendwann Referenzen auf svgs enthält, die gar nicht mehr existieren.
            }
        }, []
    );

    const getPointRefs = (pointId: string): PointVisualRefs | undefined =>
        pointRefsMap.current.get(pointId);

    const getRefsForPoints = (points: Point[]): PointVisualRefs[] => {
        const res: PointVisualRefs[] = [];
        points.forEach(point => {
            const refs = getPointRefs(point.id);
            if (refs) res.push(refs);
        });
        return res;
    };

    const addBreak = (timeline: gsap.core.Timeline, duration = 0.15) => {
        const dummy = {value: 0};
        timeline.to(dummy, {value: 1, duration, ease: "none"});
    };

    const animateInitialization = (
        timeline: gsap.core.Timeline, startStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO
    ) => {
        // initiales Active Window + Sweep Line
        timeline.to(activeSweepAreaRef.current, {attr: getActiveAreaAttrs(targetStep), opacity: 1});
        timeline.to(sweepLineRef.current, {attr: getSweepLineAttrs(targetStep), opacity: 1}, "<");
        // Initiales Best Pair und Future points colors
        animatePointColors(timeline, startStep, targetStep, "<")
        // Active Ring für initial aktive Punkte
        const activeRefs = getRefsForPoints(targetStep.activePoints);
        if (activeRefs.length > 0) {
            timeline.to(activeRefs.map(ref => ref.activeRing), {opacity: 1, duration: 0.3}, "<");
        }
        timeline.set(candidateSweepWindowRef.current, {attr: getCandidateRectAttrs(targetStep), opacity: 0}); //set ok weil opacity 0
    };

    /**nicht in COMMIT_ITERATION aufrufen (bei if(windowShrunk)) , weil da kümmert sich animateClosestPairUpdate um die farbänderung
    bei advance_and_prune kann es aufgerufen werden, weil dort sich bestpair nicht ändert */
    const animatePointColors = (
        timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO, position?: gsap.Position
    ) => {
        let firstTween = true; //damit bei position === undefined nicht jeder punkt nacheinander animiert wird
        targetStep.allPoints.forEach(point => {
            const refs = getPointRefs(point.id);
            if (!refs) return;
            const previousState = getPointVisualState(previousStep, point.id);
            const targetState = getPointVisualState(targetStep, point.id);

            const targetColor = getPointColor(targetState);
            if (getPointColor(previousState) === targetColor) return;

            timeline.to(refs.pointVisual, {color: targetColor, duration: 0.3, ease: "power1.inOut"},
                firstTween ? position : "<"
            );
            firstTween = false;
        });
    };

    const animateCurrentChange = (timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO, position?: gsap.Position) => {
        let firstTween = true;
        targetStep.allPoints.forEach(point => {
            const refs = getPointRefs(point.id);
            if (!refs) return;
            const wasCurrent = previousStep.currentPoint?.id === point.id;
            const isCurrent = targetStep.currentPoint?.id === point.id;
            if (wasCurrent === isCurrent) return;
            timeline.to(refs.currentMarker, {opacity: isCurrent ? 1 : 0, duration: 0.25, ease: "power1.inOut"},
                firstTween ? position : "<"
            );
            firstTween = false;
        });
    };

    const animateRemoveActiveRings = (timeline: gsap.core.Timeline, step: AlgorithmStepDTO) => {
        const refsOfRemoved = getRefsForPoints(step.removedPoints);
        if (refsOfRemoved.length === 0) return;
        timeline.to(refsOfRemoved.map(refs => refs.activeRing), {opacity: 0, duration: 0.3, ease: "power1.out"});
    };

    const animateCandidateRingsIn = (
        timeline: gsap.core.Timeline, step: AlgorithmStepDTO, position?: gsap.Position
    ) => {
        const candidateRefs = getRefsForPoints(
            step.candidateComparisons.map(comparison => comparison.candidate)
        );
        if (candidateRefs.length === 0) return;

        timeline.to(
            candidateRefs.map(ref => ref.candidateRing),
            {opacity: 1, duration: 0.25, ease: "power1.inOut"}, position
        );
    };

    const animateCandidateRingsOut = (
        timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, position?: gsap.Position
    ) => {
        const candidateRefs = getRefsForPoints(previousStep.candidateComparisons
            .map(comparison => comparison.candidate));
        if (candidateRefs.length === 0) return;

        timeline.to(candidateRefs.map(refs => refs.candidateRing),
            {opacity: 0, duration: 0.25, ease: "power1.out"}, position
        );
    };

    const animateCurrentInsertion = (timeline: gsap.core.Timeline, step: AlgorithmStepDTO) => {
        if (!step.currentPoint) return;
        const refs = getPointRefs(step.currentPoint.id);
        if (!refs) return;
        timeline.to(refs.activeRing, {opacity: 1, duration: 0.3, ease: "power1.inOut"});
    };

    const animateClosestPairUpdate = (timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO) => {
        if (isSamePair(previousStep.bestPair, targetStep.bestPair)) return;

        const affectedIds = new Set<string>();
        if (previousStep.bestPair) {
            affectedIds.add(previousStep.bestPair.p0.id);
            affectedIds.add(previousStep.bestPair.p1.id);
        }
        if (targetStep.bestPair) {
            affectedIds.add(targetStep.bestPair.p0.id);
            affectedIds.add(targetStep.bestPair.p1.id);
        }
        let firstTween = true;
        affectedIds.forEach(pointId => {
            const refs = getPointRefs(pointId);
            if (!refs) return;
            const targetState = getPointVisualState(targetStep, pointId);
            timeline.to(
                refs.pointVisual, {color: getPointColor(targetState), duration: 0.3, ease: "power1.inOut"},
                firstTween ? undefined : "<"
            );
            firstTween = false;
        });
    };

    const animateDeltaUpdate = (timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO) => {
        if (targetStep.windowDelta >= previousStep.windowDelta) return;
        const oldWindow = getActiveAreaAttrs(previousStep);
        const newWindow = getActiveAreaAttrs(targetStep);
        const activeArea = activeSweepAreaRef.current;
        const activeAreaDifference = activeSweepAreaDifferenceRef.current;
        if (!activeArea || !activeAreaDifference) return;

        //schraffur startet ohne breite
        timeline.set(activeAreaDifference, {
            attr: {x: oldWindow.x, y: oldWindow.y, width: 0, height: oldWindow.height}, opacity: 0.7});
        //Falls kleineres δ gefunden wurde, schrumpft das "echte" Active Window
        timeline.to(activeArea, {
            attr: newWindow, opacity: 1, duration: ACTIVE_WINDOW_SHRINK_DURATION, ease: "power2.inOut"});

        //währed das active window kleiner wird, wächst der schraffierte bereich mit, damit die differnz in größe gut sieht
        timeline.to(activeAreaDifference, {
            attr: {width: newWindow.x - oldWindow.x},
            duration: ACTIVE_WINDOW_SHRINK_DURATION, ease: "power2.inOut"
        }, "<");
        // kurz stehen lassen damit man den unterschied sehen kann
        addBreak(timeline, 0.7);
        // Schraffur wieder entfernen
        timeline.to(activeAreaDifference, {opacity: 0, duration: 0.35, ease: "power1.out"});
    };

    const animateFinish = (timeline: gsap.core.Timeline, previousStep: AlgorithmStepDTO, targetStep: AlgorithmStepDTO) => {
        timeline.to(
            [activeSweepAreaRef.current, activeSweepAreaDifferenceRef.current, sweepLineRef.current, candidateSweepWindowRef.current],
            {opacity: 0, duration: 0.5}
        );

        animateCurrentChange(timeline, previousStep, targetStep, "<");

        const activeRefs = getRefsForPoints(previousStep.activePoints);
        if (activeRefs.length > 0) {
            timeline.to(activeRefs.map(ref => ref.activeRing), {opacity: 0, duration: 0.35}, "<");
        }
        // Alle Punkte sind processed und werden so angzeigt. closestPair bleibt gold wegen getPointColor() Prio
        animatePointColors(timeline, previousStep, targetStep, "<");
    };

    const animateClosestPairLine = (timeline: gsap.core.Timeline, targetStep: AlgorithmStepDTO, position?: gsap.Position) => {
        const line = closestPairLineRef.current;
        const pair = targetStep.bestPair;
        if (!line || !pair) return;
        timeline.to(line, {attr: {x1: pair.p0.x, y1: pair.p0.y, x2: pair.p1.x, y2: pair.p1.y},
            opacity: 1, duration: 0.3, ease: "power1.inOut"}, position
        );
    };

    useGSAP(() => {
        if (!activeSweepAreaRef.current || !activeSweepAreaDifferenceRef.current || !sweepLineRef.current || !candidateSweepWindowRef.current || props.steps.length === 0) return;
        const activeArea = activeSweepAreaRef.current;
        const activeAreaDifference = activeSweepAreaDifferenceRef.current;
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

        const setPointVisualsToStep = (step: AlgorithmStepDTO) => {
            step.allPoints.forEach(point => {
                const refs = getPointRefs(point.id);
                if (!refs) return;
                const state = getPointVisualState(step, point.id);
                gsap.set(refs.pointVisual, {color: getPointColor(state)});
                gsap.set(refs.currentMarker, {opacity: state.isCurrent ? 1 : 0});
                gsap.set(refs.activeRing, {opacity: state.isActive ? 1 : 0});
                gsap.set(refs.candidateRing, {opacity: state.isCandidate ? 1 : 0});
            });
        };

        //init state setzen
        //"Neutraler" visueller Startzustand ... erste "echte" Algdarstellung ist bei Transition START -> INITIALIZATION.
        const firstStep = props.steps[0];
        gsap.set(activeArea, {opacity: 0});
        gsap.set(activeAreaDifference, {opacity: 0});
        gsap.set(sweepLine, {opacity: 0});
        gsap.set(candidateRect, {opacity: 0});
        setPointVisualsToStep(firstStep);
        //startzustand label setzen
        timeline.addLabel(myLabels[0]);

        //tweens hinzufügen:
        props.steps.slice(1).forEach((targetStep, index) => {
            const stepIndex = index + 1;
            const previousStep = props.steps[stepIndex - 1];

            switch (targetStep.stepType) {
                case "START": {
                    break; // Kann hier nie auftreten, weil START steps[0] ist.
                }
                case "INITIALIZATION": {
                    animateInitialization(timeline, previousStep, targetStep);
                    animateClosestPairLine(timeline, targetStep, "<");
                    break;
                }
                case "ADVANCE_AND_PRUNE": {
                    //Sweep Line und Active Window zum neuen current point bewegen
                    timeline.to(activeArea, {attr: getActiveAreaAttrs(targetStep), opacity: 1});
                    timeline.to(sweepLine, {attr: getSweepLineAttrs(targetStep), opacity: 1}, "<");
                    animateCurrentChange(timeline, previousStep, targetStep, "<"); //current <- p[i]
                    animatePointColors(timeline, previousStep, targetStep, "<");
                    // damit die animation einblenden besser aussieht, fährt es unsichtbar mit und so muss es bei CHECK_CANDIDATES nicht mehr bewegt werden
                    timeline.set(candidateRect, {attr: getCandidateRectAttrs(targetStep), opacity: 0});
                    addBreak(timeline, 0.15);
                    animateRemoveActiveRings(timeline, targetStep); //enfernen der außerhalb liegende active Rings animieren
                    break;
                }
                case "CHECK_CANDIDATES": {
                    //Candidate Window einblenden.
                    timeline.to(candidateRect, {opacity: 1, duration: CANDIDATE_FADE_IN_DURATION, ease: "power1.inOut"});
                    animateCandidateRingsIn(timeline, targetStep, "<");
                    // Damit man das candidaten window im Autoplay beim CHECK_CANDIDATES etwas länger sieht.
                    addBreak(timeline, CANDIDATE_AUTOPLAY_HOLD_DURATION);
                    break;
                }
                case "COMMIT_ITERATION": {
                    timeline.to(candidateRect, {opacity: 0, duration: CANDIDATE_FADE_OUT_DURATION}); // Candidate Window wieder ausblenden
                    animateCandidateRingsOut(timeline, previousStep, "<");
                    addBreak(timeline, 0.25);
                    animateDeltaUpdate(timeline, previousStep, targetStep);
                    animateClosestPairUpdate(timeline, previousStep, targetStep);
                    animateClosestPairLine(timeline, targetStep, "<");
                    addBreak(timeline, 0.15);
                    animateCurrentInsertion(timeline, targetStep);
                    addBreak(timeline, 0.5);
                    break;
                }
                case "FINISHED": {
                    animateFinish(timeline, previousStep, targetStep);
                    break;
                }
            }

            timeline.addLabel(myLabels[stepIndex]); //Hier ist "Zielzustand" des Snapshots  erreicht.
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
        dependencies: [props.steps]
    });

    if (props.loading) return <p className="closest-pair-loading">Loading...</p>;
    if (props.error) return <p className="closest-pair-error">Error: {props.error}</p>;
    if (!step) return <></>;

    const activePointsLegendValue:string = step.currentPoint === null ? "—" : step.activePoints.length === 0 ? "No active points"
        : step.activePoints.map((p) => p.label).join(", ");

    const candidateDistances = step.stepType !== "CHECK_CANDIDATES" ? "—" : step.candidateComparisons.length === 0
        ? "No comparisons" : step.candidateComparisons.map(({candidate, distance}) =>
                `d(${step.currentPoint!.label}, ${candidate.label}) = ${distance.toFixed(2)}`).join(", ");

    const candidateLabels = step.stepType !== "CHECK_CANDIDATES" ? "—" : step.candidateComparisons.length === 0
        ? "None" : step.candidateComparisons.map(({candidate}) => candidate.label) .join(", ");

    /*
    steps[i] bzw. bei Label i = "stabiler Zustand", der bereits erreicht wurde
        Bei Label i wird der Pseudocode von steps[i+1].stepType gehighlighted (was passiert wenn man auf next klickt)
    Transition i->i+1 = steps[i+1].stepType wird ausgeführt/passiert visuell
        Während der Transition i->i+1 wird weiterhin der Pseudocode von steps[i+1].stepType gehighlighted (was also gerade passiert)
     */
    const pseudoCodeStepIndex = Math.min(props.currentStep + 1, props.steps.length - 1);
    const pseudoCodeStep = props.steps[pseudoCodeStepIndex];

    return (
        <div className="algorithm-panel">
            <IOModeTabs mode="output" onChangeInput={props.onChangeInput} onSubmit={() => {}} canSubmit={false}/>

            <svg className="algorithm-canvas" viewBox={`0 0 ${props.width} ${props.height}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <pattern id="active-window-shrink-schraffur"
                        width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(90, 90, 90, 0.99)" strokeWidth="1" strokeDasharray="4 2" strokeLinecap="round"/>
                    </pattern>
                </defs>
                <rect
                    ref={activeSweepAreaDifferenceRef}
                    className="svg-activeSweepAreaDifference"
                    x={0} y={PADDING}
                    width={0} height={props.height - 2 * PADDING}
                    fill="url(#active-window-shrink-schraffur)"
                />
                <rect
                    ref={activeSweepAreaRef}
                    className="svg-activeSweepArea"
                    x={0} y={PADDING}
                    width={0} height={props.height - 2 * PADDING}
                />
                <rect
                    ref={candidateSweepWindowRef}
                    className="svg-candidateSweepWindow"
                    x={0} y={0} width={0} height={0}
                />
                <line
                    ref={sweepLineRef}
                    className="svg-sweepLine"
                    x1={0} x2={0}
                    y1={PADDING} y2={props.height - PADDING}
                />
                <line
                    ref={closestPairLineRef}
                    className="svg-closestPairLine"
                    x1={0} y1={0} x2={0} y2={0}
                />
                {props.steps[0].allPoints.map((point: Point) => ( //step.allPoints.map()
                    <XPointWithCords key={point.id} point={point} registerPointRefsInMap={registerPointRefsInMap} />
                ))}
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

            <div className="step-layout">
                <div className="step-info">

                    <div className="step-info-grid">
                        <strong>Step: {step.stepType === "START" ? "Start" : `${props.currentStep} / ${props.steps.length - 1}`}</strong>

                        <div>
                            <strong>Closest distance δ:</strong>{" "}
                            {step.bestPair?.distance.toFixed(2) ?? "—"}
                        </div>

                        <LegendEntry
                            label="Current Point: "
                            value={hasCurrentDisplayed(step) ? step.currentPoint!.label : "—"}
                            icon={<XPointIcon color="#222222" variant="current"/>}
                        />
                        <div>
                            <LegendEntry
                                label="Closest pair: "
                                value={step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                                icon={<XPointIcon color="#0000CD" ringStyle="none"/>}
                            />
                        </div>
                        <div>
                            <LegendEntry
                                label="Active Set: "
                                value={activePointsLegendValue}
                                icon={<XPointIcon color="#222222" ringStyle="active"/>}
                            />
                        </div>

                        <div>
                            <LegendEntry
                                label="Candidates: "
                                value={candidateLabels}
                                icon={<XPointIcon color="#222222" ringStyle="candidate"/>}
                            />
                        </div>
                    </div>
                    <div className="closest-pair-candidate-distances">
                        <strong>Distances to current:</strong>{" "}
                        {candidateDistances}
                    </div>

                    <div className="closest-pair-step-description"> {step.description} </div>
                </div>

                <PseudoCodePanel
                    lines={SWEEP_LINE_PSEUDOCODE}
                    activeLineIds={getActivePseudoCodeLineIds(pseudoCodeStep.stepType)}
                    title={"Closest Pair Pseudocode"}
                />
            </div>

            <ImportExportDialog
                onImport={props.onImport}
                createExportString={props.createExportString}
            />
        </div>
    );
}
