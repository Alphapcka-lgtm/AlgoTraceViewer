import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import type {EhrlichSwapStepDTO} from "../Api.ts";
import React, {useMemo, useRef, useState} from "react";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {createStepLabels, getStepIndexFromTimeline} from "../../shared/Utils.tsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

// Kein MotionPathPlugin mehr – wir bauen den Bogen selbst über zwei parallele
// Tweens (x und y), das ist einfacher und hat keine Koordinaten-Fallstricke.

// ─── Typen ────────────────────────────────────────────────────────────────────

type SwapOutputProps = {
    values: string[];
    steps: EhrlichSwapStepDTO[];
    onChangeInput: () => void;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    progress: number;
    setProgress: React.Dispatch<React.SetStateAction<number>>;
}

// ─── Layout-Konstanten ────────────────────────────────────────────────────────

const STEP_DURATION = 0.8;

const SVG_WIDTH = 1920;
const SVG_HEIGHT = 1080;

const ARRAY_START_X = 600;  // X des linken Rands der ersten Box
const START_X = 140;
const A_Y = 220;      // Y-Oberkante der a-Array-Zeile
const B_Y = 560;      // Y-Oberkante der b-Array-Zeile

const BOX_WIDTH = 160;
const BOX_HEIGHT = 90;
const GAP = 24;

const MAX_ELEMENTS = 8;

const K_GRAPH_X = START_X;
const K_GRAPH_Y = 800;
const K_GRAPH_WIDTH = 1640;
const K_GRAPH_HEIGHT = 220;

// Bogenhöhe: skaliert mit dem Abstand zwischen den tauschenden Boxen,
// damit sich die Bögen beider Boxen nicht überlagern.
const ARC_LIFT_BASE = 100;
const ARC_LIFT_PER_SLOT = 25;

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

/**
 * Gibt den X-Wert des linken Rands einer Box an einem bestimmten Slot zurück.
 * "Slot" = logische Position im Array (0, 1, 2, ...).
 */
function slotX(slot: number): number {
    return ARRAY_START_X + slot * (BOX_WIDTH + GAP);
}

/**
 * Animiert den Tausch zweier Boxen in Array a mit einem Bogen.
 * Den Bogen bauen wir so:
 *   - x: linearer Tween mit `+=delta` (direkt von links nach rechts / rechts nach links)
 *   - y: separater Tween, der nach oben geht und wieder zurück kommt
 *        → gsap.to mit yoyo:true & repeat:1, halbe Duration pro Hälfte
 *
 * Box die nach oben geht (goUp=true):  y += -lift → zurück
 * Box die nach unten geht (goUp=false): y += +lift → zurück
 * Dadurch kreuzen sich die Wege der beiden tauschenden Boxen nicht.
 *
 * @param el        Das SVGGElement der Box
 * @param deltaX    Wie weit die Box horizontal bewegt werden soll (positiv oder negativ)
 * @param lift      Wie weit der Bogen ausschlagen soll (immer positiv)
 * @param goUp      Ob der Bogen nach oben (true) oder nach unten (false) geht
 * @param timeline  Die GSAP-Timeline, in die die Tweens eingefügt werden
 * @param position  GSAP-Zeitposition in der Timeline (z.B. Label-String)
 */
function animateSwapArc(el: SVGGElement, deltaX: number, lift: number, goUp: boolean, timeline: gsap.core.Timeline, position: string | number): void {
    const yDirection = goUp ? -1 : 1;

    // x-Tween: bewegt die Box horizontal zum Ziel-Slot
    timeline.to(el, {x: `+=${deltaX}`, duration: STEP_DURATION, ease: "power2.inOut"}, position);

    // y-Tween: erzeugt den Bogen – geht zur Mitte hoch/runter, dann zurück
    // repeat:1 + yoyo:true bedeutet: hin und zurück, also insgesamt STEP_DURATION
    timeline.to(el,
        {y: `+=${yDirection * lift}`, duration: STEP_DURATION / 2, ease: "power1.in", repeat: 1, yoyo: true},
        position  // "<" würde hier auch gehen, aber position ist klarer
    );
}

// ─── Komponente ───────────────────────────────────────────────────────────────

export function SwapOutput(props: SwapOutputProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline({paused: true}));
    const lastProgressUpdateRef = useRef(0);

    const labels = useMemo(() => createStepLabels(props.steps.length), [props.steps.length]);

    const maxK =  props.values.length

    const kLabelDistance = Array.from({length: maxK-1}, (_, i) => i + 1).reduce((a, b) => a * b, 1)

    const kGraph = useMemo(() => {

        const currentIndex = props.currentStep;

        const coordinates = props.steps
            .slice(0, currentIndex + 1)
            .map((step, index) => {
                // Abstand zum aktuellen/neuesten Punkt
                const distanceFromCurrent =
                    currentIndex - index;

                // Aktueller Punkt steht ganz rechts.
                // Ältere Punkte wandern nach links.
                const x =
                    K_GRAPH_X +
                    K_GRAPH_WIDTH -
                    distanceFromCurrent * (K_GRAPH_WIDTH / (props.steps.length - 1));

                const normalizedK = step.k / (maxK + 1);

                const y =
                    K_GRAPH_Y +
                    K_GRAPH_HEIGHT -
                    normalizedK * K_GRAPH_HEIGHT;

                return {
                    x,
                    y,
                    k: step.k,
                    i: index
                };
            })
            // Alles abschneiden, was links aus dem Fenster gelaufen ist.
            .filter(point => point.x >= K_GRAPH_X);

        return {
            coordinates,
            points: coordinates
                .map(point => `${point.x},${point.y}`)
                .join(" ")
        };
    }, [props.steps, props.currentStep, maxK]);

    const step: EhrlichSwapStepDTO | undefined = props.steps[props.currentStep];

    // Initiale Werte aus Schritt 0. React rendert die Boxen genau einmal damit.
    // Danach ist GSAP alleiniger Eigentümer der Box-Positionen im DOM.
    const initialA = props.steps[0]?.valuesBefore ?? [];
    const initialB = props.steps[0]?.bBefore ?? [];
    const count = Math.min(initialA.length, MAX_ELEMENTS);

    // ── Refs ──────────────────────────────────────────────────────────────────
    //
    // aRefs.current[i] → DOM-Element der Box, die ursprünglich an Index i stand.
    // Die Box behält diese ID für immer, egal wie oft sie verschoben wird.

    const aRefs = useRef<(SVGGElement | null)[]>([]);
    const bRefs = useRef<(SVGGElement | null)[]>([]);

    // ── Slot-Tracking ─────────────────────────────────────────────────────────
    //
    // aCurrentSlot.current[i] = aktueller Slot von Box i
    //
    // Beispiel nach einem Swap von Slot 0 und Slot 2:
    //   vorher: [0, 1, 2, 3]   (Box i steht auf Slot i)
    //   nachher: [2, 1, 0, 3]  (Box 0 steht jetzt auf Slot 2, Box 2 auf Slot 0)
    //
    // Mit indexOf(slot) findet man die Box, die aktuell auf einem bestimmten Slot steht.
    // Das wird beim Timeline-Aufbau gebraucht, um zu wissen welche Box wohin animiert wird.

    const aCurrentSlot = useRef<number[]>([]);
    const bCurrentSlot = useRef<number[]>([]);

    // ── Playback-Geschwindigkeit ──────────────────────────────────────────────

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    // ── Timeline-Aufbau ───────────────────────────────────────────────────────

    useGSAP(() => {
        if (props.steps.length === 0) return;
        timelineRef.current?.kill();

        // Alle Transforms zurücksetzen, damit ein Neuaufbau sauber startet
        for (let i = 0; i < count; i++) {
            if (aRefs.current[i]) gsap.set(aRefs.current[i], {x: 0, y: 0});
            if (bRefs.current[i]) gsap.set(bRefs.current[i], {x: 0, y: 0});
        }

        // Jede Box startet auf "ihrem" Slot (Box i → Slot i)
        aCurrentSlot.current = Array.from({length: count}, (_, i) => i);
        bCurrentSlot.current = Array.from({length: count}, (_, i) => i);

        const timeline = gsap.timeline({
            paused: true,
            onUpdate: () => {
                const tl = timelineRef.current;
                const now = performance.now();
                if (now - lastProgressUpdateRef.current > 100) {
                    props.setProgress(tl.progress());
                    lastProgressUpdateRef.current = now;
                }
                props.setCurrentStep(getStepIndexFromTimeline(tl, labels));
            },
            onComplete: () => {
                props.setProgress(1);
                setIsPlaying(false);
            },
        });

        props.steps.forEach((s, stepIdx) => {
            timeline.addLabel(labels[stepIdx]);

            // Letzter Schritt ("Done") → kein Tausch, nur Zeit vergehen lassen
            if (s.swapIndex < 0) {
                timeline.to({}, {duration: STEP_DURATION});
                return;
            }

            // ── Swap in Array a: a[0] ↔ a[swapIndex] ──────────────────────
            //
            // Welche Box steht aktuell auf Slot 0? Welche auf Slot swapIndex?
            // "aktuell" = nach allen bisherigen Animationsschritten.

            const aBoxAtSlot0     = aCurrentSlot.current.indexOf(0);
            const aBoxAtSwapSlot  = aCurrentSlot.current.indexOf(s.swapIndex);

            // Aktuelle Slots (nur zur Lesbarkeit – indexOf gibt uns diese bereits)
            const aSlotOf0        = aCurrentSlot.current[aBoxAtSlot0];    // immer 0
            const aSlotOfSwap     = aCurrentSlot.current[aBoxAtSwapSlot]; // immer s.swapIndex

            // Wie weit muss sich jede Box horizontal bewegen?
            // slotX(ziel) - slotX(start) = pixel-Abstand zwischen den beiden Slots.
            // Da jede Box ihre X-Position als akkumulierten Transform speichert,
            // ist "+= delta" die korrekte GSAP-Schreibweise.
            const aDeltaFor0     = slotX(aSlotOfSwap) - slotX(aSlotOf0);   // > 0 (nach rechts)
            const aDeltaForSwap  = slotX(aSlotOf0)    - slotX(aSlotOfSwap); // < 0 (nach links)

            // Bogenhöhe skaliert mit dem Abstand der Slots
            const slotDistance = Math.abs(s.swapIndex);
            const lift = ARC_LIFT_BASE + slotDistance * ARC_LIFT_PER_SLOT;

            const elA0    = aRefs.current[aBoxAtSlot0];
            const elASwap = aRefs.current[aBoxAtSwapSlot];

            if (elA0 && elASwap) {
                // Box auf Slot 0 → fährt nach oben über die anderen Boxen
                animateSwapArc(elA0,    aDeltaFor0,    lift, true,  timeline, labels[stepIdx]);
                // Box auf swapIndex → fährt nach unten (die Bögen kreuzen sich nicht)
                animateSwapArc(elASwap, aDeltaForSwap, lift, false, timeline, labels[stepIdx]);
            }

            // Slot-Tracking SOFORT aktualisieren (nicht via .call),
            // weil der Wert beim Aufbau der nächsten Schritte schon korrekt sein muss.
            // .call würde erst zur Laufzeit der Animation feuern – zu spät für den Aufbau.
            aCurrentSlot.current[aBoxAtSlot0]    = aSlotOfSwap;
            aCurrentSlot.current[aBoxAtSwapSlot] = aSlotOf0;

            // ── Reverse von b[1..k-1] ──────────────────────────────────────
            //
            // Dieselbe Logik wie im Java-Code: linker Index und rechter Index
            // wandern aufeinander zu und tauschen jeweils die Positionen.
            // Kein Bogen hier

            let leftIdx  = 1;
            let rightIdx = s.k - 1;

            while (leftIdx < rightIdx) {
                const bBoxAtLeft  = bCurrentSlot.current.indexOf(leftIdx);
                const bBoxAtRight = bCurrentSlot.current.indexOf(rightIdx);

                const bSlotOfLeft  = bCurrentSlot.current[bBoxAtLeft];   // = leftIdx
                const bSlotOfRight = bCurrentSlot.current[bBoxAtRight];  // = rightIdx

                const bDeltaForLeft  = slotX(bSlotOfRight) - slotX(bSlotOfLeft);  // nach rechts
                const bDeltaForRight = slotX(bSlotOfLeft)  - slotX(bSlotOfRight); // nach links

                const elBLeft  = bRefs.current[bBoxAtLeft];
                const elBRight = bRefs.current[bBoxAtRight];

                if (elBLeft && elBRight) {
                    // Alle b-Tausche eines Schritts starten gleichzeitig ("<")
                    timeline.to(elBLeft,  {x: `+=${bDeltaForLeft}`,  duration: STEP_DURATION, ease: "power2.inOut"}, "<");
                    timeline.to(elBRight, {x: `+=${bDeltaForRight}`, duration: STEP_DURATION, ease: "power2.inOut"}, "<");
                }

                // Slot-Tracking sofort aktualisieren (gleiche Begründung wie bei a)
                bCurrentSlot.current[bBoxAtLeft]  = bSlotOfRight;
                bCurrentSlot.current[bBoxAtRight] = bSlotOfLeft;

                leftIdx++;
                rightIdx--;
            }
        });

        timelineRef.current = timeline;
        timeline.progress(props.progress).pause();
        timeline.timeScale(playbackSpeed);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true});
        };
    }, {dependencies: [props.steps]});

    if (!step) return <></>;

    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode="output"
                onChangeInput={props.onChangeInput}
                onSubmit={() => {}}
                canSubmit={false}
            />

            <svg
                className="algorithm-canvas"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <text x={START_X} y={A_Y + BOX_HEIGHT / 2} fontSize="30" fontFamily="monospace">a (input)</text>
                <text x={START_X} y={B_Y + BOX_HEIGHT / 2} fontSize="30" fontFamily="monospace">b (swap-Tabelle)</text>

                {Array.from({length: props.values.length}, (_, i) => (
                    <>
                        <text
                            x={ARRAY_START_X + i * (BOX_WIDTH + GAP) + BOX_WIDTH / 2}
                            y={A_Y - 12}
                            textAnchor="middle"
                            fontSize="22"
                            fontFamily="monospace"
                            fill="#999"
                        >
                            {i}
                        </text>
                        <text
                            x={ARRAY_START_X + i * (BOX_WIDTH + GAP) + BOX_WIDTH / 2}
                            y={B_Y - 12}
                            textAnchor="middle"
                            fontSize="22"
                            fontFamily="monospace"
                            fill="#999"
                        >
                            {i}
                        </text>
                    </>
                ))}

                {initialA.slice(0, count).map((value, i) => (
                    <g key={`a-${i}`} ref={el => { aRefs.current[i] = el; }}>
                        <rect
                            x={slotX(i)} y={A_Y}
                            width={BOX_WIDTH} height={BOX_HEIGHT}
                            stroke="black" strokeWidth="3" fill="white" rx="10"
                        />
                        <text
                            x={slotX(i) + BOX_WIDTH / 2} y={A_Y + BOX_HEIGHT / 2}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize="28" fontFamily="monospace"
                        >
                            {value}
                        </text>
                    </g>
                ))}

                {initialB.slice(0, count).map((value, i) => (
                    <g key={`b-${i}`} ref={el => { bRefs.current[i] = el; }}>
                        <rect
                            x={slotX(i)} y={B_Y}
                            width={BOX_WIDTH} height={BOX_HEIGHT}
                            stroke="black" strokeWidth="3" fill="white" rx="10"
                        />
                        <text
                            x={slotX(i) + BOX_WIDTH / 2} y={B_Y + BOX_HEIGHT / 2}
                            textAnchor="middle" dominantBaseline="central"
                            fontSize="28" fontFamily="monospace"
                        >
                            {value}
                        </text>
                    </g>
                ))}

                <g>
                    <rect
                        x={K_GRAPH_X}
                        y={K_GRAPH_Y}
                        width={K_GRAPH_WIDTH}
                        height={K_GRAPH_HEIGHT}
                        fill="none"
                        stroke="#aaa"
                        strokeWidth="2"
                        rx="30"
                    />

                    {Array.from({length: maxK}, (_, index) => {
                        const k = index + 1;

                        const y =
                            K_GRAPH_Y +
                            K_GRAPH_HEIGHT -
                            (k / (maxK+1)) * K_GRAPH_HEIGHT;

                        return (
                            <g key={`k-line-${k}`}>
                                <line
                                    x1={K_GRAPH_X}
                                    y1={y}
                                    x2={K_GRAPH_X + K_GRAPH_WIDTH}
                                    y2={y}
                                    stroke="#ddd"
                                    strokeWidth="1"
                                />

                                <text
                                    x={K_GRAPH_X - 10}
                                    y={y}
                                    textAnchor="end"
                                    dominantBaseline="central"
                                    fontSize="18"
                                    fontFamily="monospace"
                                    fill="#777"
                                >
                                    {k}
                                </text>
                            </g>
                        );
                    })}

                    <polyline
                        points={kGraph.points}
                        fill="none"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />

                    {kGraph.coordinates.filter(c  => (c.i + 1) % kLabelDistance === 0).map(c => {
                        return <text
                            x={c.x}
                            y={K_GRAPH_Y + K_GRAPH_HEIGHT + 20}
                            textAnchor="end"
                            dominantBaseline="central"
                            fontSize="18"
                            fontFamily="monospace"
                            fill="#777"
                        >
                            {c.i + 1}
                        </text>;
                    })}

                    {kGraph.coordinates.length > 0 && (() => {
                        const current = kGraph.coordinates[kGraph.coordinates.length - 1];

                        return (
                            <>
                                <circle
                                    cx={current.x}
                                    cy={current.y}
                                    r={8}
                                    fill="black"
                                />
                                <text
                                    x={current.x + 40}
                                    y={current.y}
                                    textAnchor="end"
                                    fontSize="30"
                                    fontFamily="monospace"
                                >
                                    {current.k}
                                </text>
                            </>
                        );
                    })()}
                </g>
            </svg>

            <OutputControls
                timelineRef={timelineRef}
                labels={labels}
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
                <div className="step-description">{step.description}</div>
                <div className="step-info-grid">
                    <div><strong>Step:</strong> {props.currentStep + 1} / {props.steps.length}</div>
                    <div><strong>k:</strong> {step.k}</div>
                    <div><strong>Swap index:</strong> {step.swapIndex < 0 ? "—" : step.swapIndex}</div>
                    <div><strong>Values before:</strong> {step.valuesBefore.join(", ")}</div>
                    <div><strong>Values after:</strong> {step.valuesAfter.join(", ")}</div>
                    <div><strong>b before:</strong> {step.bBefore.join(", ")}</div>
                    <div><strong>b after:</strong> {step.bAfter.join(", ")}</div>
                </div>
            </div>
        </div>
    );
}
