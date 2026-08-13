import type {AlgorithmStepDTO, Point, OutputProps, PointVisualRefs} from "../shared/Types.tsx";
import {getCurrentTimelineStepIndex, createStepLabels, SVG_WIDTH, SVG_HEIGHT} from "../../shared/Utils.tsx";
import {getActivePseudoCodeLineIds, SWEEP_LINE_PSEUDOCODE} from "./PseudoCode.ts";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {isSamePair} from "../shared/Utils.ts";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {useCallback, useMemo, useRef, useState} from "react";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {XPointWithCords} from "../shared/Points.tsx";
import {Legend} from "./Legend.tsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {
    getActiveAreaAttrs,
    getCandidateRectAttrs,
    getPointColor,
    getPointVisualState,
    getSweepLineAttrs
} from "./OutputUtils.ts";

const STEP_DURATION = 0.8;
const CANDIDATE_FADE_IN_DURATION = 0.45;
const CANDIDATE_FADE_OUT_DURATION = 0.25;
const CANDIDATE_AUTOPLAY_HOLD_DURATION = 0.8;
const ACTIVE_WINDOW_SHRINK_DURATION = 0.7;
export const PADDING = 1;

export function Output(props: OutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const activeSweepAreaRef = useRef<SVGRectElement>(null);
    const sweepLineRef = useRef<SVGLineElement>(null);
    const candidateSweepWindowRef = useRef<SVGRectElement>(null);
    const step: AlgorithmStepDTO = props.steps[props.cProps.currentStepIndex];
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

    const initializeVisualState = (firstStep: AlgorithmStepDTO) => {
        //init state setzen
        //"Neutraler" visueller Startzustand ... erste "echte" Algdarstellung ist bei Transition START -> INITIALIZATION.
        gsap.set(activeSweepAreaRef.current, {opacity: 0});
        gsap.set(activeSweepAreaDifferenceRef.current, {opacity: 0});
        gsap.set(sweepLineRef.current, {opacity: 0});
        gsap.set(candidateSweepWindowRef.current, {opacity: 0});

        firstStep.allPoints.forEach(point => {
            const refs = getPointRefs(point.id);
            if (!refs) return;
            const state = getPointVisualState(firstStep, point.id);
            gsap.set(refs.pointVisual, {color: getPointColor(state)});
            gsap.set(refs.currentMarker, {opacity: state.isCurrent ? 1 : 0});
            gsap.set(refs.activeRing, {opacity: state.isActive ? 1 : 0});
            gsap.set(refs.candidateRing, {opacity: state.isCandidate ? 1 : 0});
        });
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
        const sweepLine = sweepLineRef.current;
        const candidateRect = candidateSweepWindowRef.current;

        timelineRef.current?.kill();

        // Startzustand der Timeline aus app.
        // Beim normalen Submit (nichts importered) ist props.progress = 0 und bei import ist es der importierte progress...
        const initialProgress: number = props.cProps.progress;

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
                    props.cProps.setProgress(tl.progress());
                    lastProgressUpdateRef.current = now;
                }
                const stepIndex: number = getCurrentTimelineStepIndex(tl, myLabels);
                props.cProps.setCurrentStepIndex(stepIndex);
            },
            onComplete: () => {
                props.cProps.setProgress(1);
                setIsPlaying(false);
                timelineRef.current.pause();
            }
        });

        initializeVisualState(props.steps[0]);
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
        //timeline.timeScale(playbackSpeed); //hat keine auswirkung auf progress ... timeScale verändert nur wie schnell Timeline abgespielt wird
        setIsPlaying(false);

        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true}); //damit eine pausierte leere timeline erzeugt wird... aber eigentlich egal finde es nur schöner so
        };
    }, {
        dependencies: [props.steps]
    });

    /*
    steps[i] bzw. bei Label i = "stabiler Zustand", der bereits erreicht wurde
        Bei Label i wird der Pseudocode von steps[i+1].stepType gehighlighted (was passiert wenn man auf next klickt)
    Transition i->i+1 = steps[i+1].stepType wird ausgeführt/passiert visuell
        Während der Transition i->i+1 wird weiterhin der Pseudocode von steps[i+1].stepType gehighlighted (was also gerade passiert)
     */
    const pseudoCodeStepIndex = Math.min(props.cProps.currentStepIndex + 1, props.steps.length - 1);
    const pseudoCodeStep = props.steps[pseudoCodeStepIndex];

    return (
        <div className="algorithm-panel">
            <IOModeTabs mode="output" onChangeInput={props.cProps.onChangeInput} onSubmit={() => {}} canSubmit={false}/>

            <svg className="algorithm-canvas" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
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
                    width={0} height={SVG_HEIGHT - 2 * PADDING}
                    fill="url(#active-window-shrink-schraffur)"
                />
                <rect
                    ref={activeSweepAreaRef}
                    className="svg-activeSweepArea"
                    x={0} y={PADDING}
                    width={0} height={SVG_HEIGHT - 2 * PADDING}
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
                    y1={PADDING} y2={SVG_HEIGHT - PADDING}
                />
                {props.steps[0].allPoints.map((point: Point) => ( //step.allPoints.map()
                    <XPointWithCords key={point.id} point={point} registerPointRefsInMap={registerPointRefsInMap} />
                ))}
                <line
                    ref={closestPairLineRef}
                    className="svg-closestPairLine"
                    x1={0} y1={0} x2={0} y2={0}
                />
            </svg>

            <OutputControls
                timelineRef={timelineRef}
                labels={myLabels}
                currentStep={props.cProps.currentStepIndex}
                setCurrentStep={props.cProps.setCurrentStepIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.cProps.progress}
                setProgress={props.cProps.setProgress}
                playbackSpeed={playbackSpeed}
                onPlaybackSpeedChange={changePlaybackSpeed}
            />

            <div className="step-layout">
                <div className="step-layout-side">

                    <Legend
                        step={step}
                        currentStepIndex={props.cProps.currentStepIndex}
                        totalSteps={props.steps.length-1}
                    />

                    <div className="step-layout-actions">
                        <ImportExportDialog
                            onImport={props.cProps.onImport}
                            createExportString={props.cProps.createExportString}
                        />
                    </div>
                </div>

                <PseudoCodePanel
                    lines={SWEEP_LINE_PSEUDOCODE}
                    activeLineIds={getActivePseudoCodeLineIds(pseudoCodeStep.stepType)}
                />
            </div>

        </div>
    );
}
