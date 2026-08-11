import type {SaisOutputProps, SaisResponseDto, Step, SvgCellData} from "../shared/Types.tsx";
import {useMemo, useRef, useState} from "react";
import gsap from "gsap";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {BucketsRow} from "../shared/BucketsRow.tsx";
import {TypesRow} from "../shared/TypesRow.tsx";
import {TextRow} from "../shared/TextRow.tsx";
import {IndexRow} from "../shared/IndexRow.tsx";
import {createStepLabels, getStepIndexFromTimeline} from "../../shared/Utils.tsx";
import {useGSAP} from "@gsap/react";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {PSEUDOCODE_SAIS} from "./PseudoCode.tsx";

function buildSteps(data: SaisResponseDto): Step[] {
    const steps: Step[] = [];

    steps.push({
        phaseLabel: "Setup",
        title: "Classify S-type / L-type positions",
        description: "Each position is S-type if its suffix is lexicographically smaller than the next position's suffix, or L-type if larger. Positions marked LMS (Left-Most S-type) are L→S transitions and anchor the whole algorithm.",
        kind: "intro",
    });

    if (data.guessLmsSteps.length > 0) {
        data.guessLmsSteps.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Roughly place LMS suffixes (left-to-right scan)" : "Continue rough LMS placement",
                description:
                    "Scanning left to right, each LMS position is dropped at the current tail of its character's bucket. This rough pass just seeds the next two induction passes — order isn't correct yet.",
                kind: "guess-lms-frame",
                frameIndex: i,
            });
        });
    }

    if (data.guessInduceL.length > 0) {
        data.guessInduceL.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Induce L-type suffixes (left-to-right)" : "Continue inducing L-types",
                description:
                    "Scanning the array left to right: whenecer a slot holds position p and p-1 is L-type, place p-1 at the current head of its bucket.",
                kind: "guess-induce-l-frame",
                frameIndex: i,
            });
        });
    }

    if (data.guessInduceS.length > 0) {
        data.guessInduceS.forEach((_, i) => {
            steps.push({
                phaseLabel: "Phase 1",
                title: i === 0 ? "Induce S-type suffixes (right-to-left) — LMS now sorted" : "Continue inducing S-types",
                description:
                    "Scanning right to left: whenever a slot holds position p and p-1 is S-type, place p-1 at the current tail of its bucket. After this pass, LMS suffixes sit in correct realtive order.",
                kind: "guess-induce-s-frame",
                frameIndex: i,
            });
        });
    }

    steps.push({
        phaseLabel: "Phase 2",
        title: "Name each LMS substring",
        description:
            "Using the sorted LMS order just found, compare each LMS substring (from one LMS position to the next, inclusive) to its predecessor: identical → same name, different → next name.",
        kind: "naming",
    });

    steps.push({
        phaseLabel: "Phase 2",
        title: "Reduced string & recursion check",
        description:
            "Write the assigend names in the order their LMS positions occur in the original string. If every name is unique, the order is already knwon. If two LMS substrings share a name, the backend recurses SA-IS in this reduced string to resolve the tie.",
        kind: "reduced",
    });

    if (data.saLmsAdded.some((v) => v !== -1)) {
        steps.push({
            phaseLabel: "Phase 3",
            title: "Place LMS suffixes in correct order (right-to-left",
            description: "Using the now-correct LMS order, scan it right to left, placing each LMS suffix at the current tail of its bucket.",
            kind: "place-lms-frame",
        });
    }

    data.saInduceL.forEach((_, i) => {
        steps.push({
            phaseLabel: "Phase 3",
            title: i === 0 ? "Final induce L-types (left-to-right)" : "Continue final L-type induction",
            description: "Same induction rule as before, now seededed with the correctly ordered LMS suffixes",
            kind: "sa-induce-l-frame",
            frameIndex: i,
        });
    });

    data.saInduceS.forEach((_, i) => {
        steps.push({
            phaseLabel: "Phase 3",
            title: i === 0 ? "Final induce S-types — suffix array complete" : "Continue final S-type induction",
            description: i === 0 ? "Final right-to-left induction pass. The suffix array is now fully sorted." : "Continuing the final right-to-left-pass.",
            kind: "sa-induce-s-frame",
            frameIndex: i,
        });
    });

    steps.push({
        phaseLabel: "Result",
        title: "Final suffix array",
        description: "Every suffix of the input, listed in lexicopraphic order.",
        kind: "final",
    });

    return steps;
}

const COLORS = {
    bg: "#15161A",
    panel: "#1C1E24",
    panelBorder: "#2C2F38",
    textPrimary: "#EDEDEF",
    textSecondary: "#9A9CA6",
    textMuted: "#6B6D78",
    amber: "#E8A33D",
    amberBg: "rgba(232,163,61,0.12)",
    violet: "#9C8CF0",
    violetBg: "rgba(156,140,240,0.14)",
    teal: "#5FC9B8",
    tealBg: "rgba(95,201,184,0.12)",
    rose: "#E8806B",
    roseBg: "rgba(232,128,107,0.12)",
    cellBg: "#23252C",
    cellEmpty: "#1A1B20",
    cellHighlight: "#00ff70",
};

// TODO: export
const STEP_DURATION = 1.0;

export function SaisOutput(props: SaisOutputProps) {
    const data = props.output;
    const steps = useMemo(() => buildSteps(data), [data]);

    const lmsNeedsRecursion = useMemo(() => {
        const names = data.lmsPositions.map((p) => data.lmsNames[p]);
        return new Set(names).size !== names.length;
    }, [data]);

    const getLmsOffsets = () => {
        const offsets = []
        for (let offset = 0; offset < props.output.source.length; offset++) {
            if (props.output.typeMapDto.map[offset].isLms) {
                offsets.push(offset);
            }
        }
        return offsets;
    }

    const lmsOffsets = getLmsOffsets();

    const lmsSet = new Set(data.lmsPositions);

    function lmsSubstr(pos: number): string {
        const res: string[] = [];
        const n = data.source.length;
        for (let k = pos; k < n; k++) {
            res.push(data.source[k]);
            if (k > pos && lmsSet.has(k)) break;
            if (k === n - 1) break;
        }
        return res.join("");
    }

    const reducedCells: SvgCellData[] = data.lmsPositions.map((pos, i) => ({
        label: String(data.reduced[i]),
        sub: `pos ${pos}`,
        bg: COLORS.amberBg,
        color: COLORS.amber,
        ringColor: COLORS.amber,
        bold: true,
    }));

    const sortedCells: SvgCellData[] = data.reducedSorted.map((ri) => ({
        label: String(ri),
        sub: `→ pos ${data.lmsPositions[ri]}`,
        bg: COLORS.violetBg,
        color: COLORS.violet,
        ringColor: COLORS.violet,
    }));

    // TODO: old stuff!
    // console.log(props.output);
    //
    const cellWidth = 30
    const cellHeight = 30
    const boxCount = props.output.source.length;
    const arrowXStart = 10 + 10 + props.output.reduced.length * cellWidth
    const arrowXEnd = 180 + props.output.reduced.length * cellWidth
    const arrowTextX = (arrowXStart + arrowXEnd) / 2
    const arrowLen = 10;

    const emptySaSvgElement = () => {
        const elements = [];
        for (let index = 0; index < boxCount; index++) {
            elements.push(
                <g id={"empty_sa_cell_" + index} key={"empty_sa_cell_" + index}>
                    <rect
                        x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                        y={guessesYOffset}
                        width={cellWidth}
                        height={cellHeight}
                        // fill cell yellow when suffix is lms
                        fill={"white"}
                        stroke="black"
                        // style={{opacity: 0}}
                    />
                    <text
                        x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                        y={guessesYOffset + cellHeight * 0.7}
                        textAnchor="middle"
                        // style={{opacity: 0}}
                    >
                        {""}
                    </text>
                </g>
            );
        }

        return (
            <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                {elements}
            </g>
        );
    }

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(
        1 // one step for displaying types
        + 1 // one stop for displaying buckets
        + 1 // one for empty sa
        + props.output.guessLmsSteps.length
        + props.output.guessInduceS.length
        + props.output.guessInduceL.length
        + 1 // for the final guessed sa
        + props.output.lmsOrder.length
        + 3 // +1 for reduced sa, +1 for arrow, +1 for sorted reduced sa
        + 1 // for the placed lms
        + props.output.saInduceL.length
        + props.output.saInduceS.length
        + props.output.sa.length
    );

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
    };

    useGSAP(() => {
        gsap.registerPlugin(DrawSVGPlugin);
        gsap.registerPlugin(ScrambleTextPlugin);

        tlRef.current?.kill();

        // create timeline
        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = tlRef.current;
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        tlRef.current = timeline;

        // draw initial states
        timeline.addLabel(labels[0]);

        // {
        //     timeline.set("#index_row", {opacity: 100});
        //     timeline.set("#text_row", {opacity: 100},);
        //     timeline.set("#buckets_row", {opacity: 100},);
        //     timeline.set("#types_row", {opacity: 100},);
        //
        //     timeline.from("#index_row", {drawSVG: "50% 50%"}, "<");
        //     timeline.from("#text_row", {drawSVG: "50% 50%"}, "<");
        //     timeline.from("#types_row", {drawSVG: "50% 50%"}, "<");
        //     timeline.from("#buckets_row", {drawSVG: "50% 50%"}, "<");
        // }

        let currentCounter = 0;
        // display types
        {
            timeline.call(() => props.setActiveLineIds(["typeMap"]));
            timeline.to("#types_row", {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display buckets
        {
            timeline.call(() => props.setActiveLineIds(["buckets"]));
            timeline.to("#buckets_row", {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display empty suffix array
        {
            timeline.call(() => props.setActiveLineIds(["saInit"]));
            timeline.to(`#s${currentCounter}`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms guess steps
        timeline.call(() => props.setActiveLineIds(["lmsGuess"]));
        props.output.guessLmsSteps.forEach((step, index) => {
            let originalFill = gsap.getProperty(`#text_row_name_${step.sourceIndex}`, "fill");
            timeline.to(`#text_row_name_${step.sourceIndex}`, {
                fill: COLORS.cellHighlight,
            });
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(`#text_row_name_${step.sourceIndex}`, {
                fill: originalFill,
            });
            timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {
                fill: "white",
            }, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // L induce steps
        props.output.guessInduceL.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLGuess"]));
            const saCell = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_name_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCell, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCell, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight});
            // timeline.to(saCell, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceLGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // S induce steps
        props.output.guessInduceS.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSGuess"]));
            const saCell = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_name_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCell, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCell, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight,});
            // timeline.to(saCell, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceSGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // guessed suffix array
        timeline.call(() => props.setActiveLineIds(["assignName"]));
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            // timeline.set("#s" + (currentCounter - 1), {opacity: 0});
            timeline.to("#s" + currentCounter, {opacity: 100});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms names
        props.output.lmsOrder.forEach(() => {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // display reduced sa
        timeline.call(() => props.setActiveLineIds(["pos", "reduced"]));
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display arrow
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display sorted reduced sa
        {
            timeline.call(() => {
                const lines = ["initRsa", "ifDuplicateNames"];
                if (lmsNeedsRecursion) {
                    lines.push("else", "ifDuplicateNamesElse");
                } else {
                    lines.push("ifDuplicateNamesThen");
                }
                props.setActiveLineIds(lines);
            });
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // TODO: animate
        // lms placement after reduced sort
        {
            timeline.call(() => props.setActiveLineIds(["forEachFinalLms", "finalLmsOffset", "finalLmsPlace"]));
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // final l types induce
        props.output.saInduceL.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLFinal"]));
            const saCell = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_name_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCell, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCell, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight});
            // timeline.to(saCell, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceLFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");

            // timeline.set("#s" + currentCounter, {opacity: 100});
            // timeline.set("#s" + (currentCounter - 1), {opacity: 0}, ">");
            // timeline.to("#s" + currentCounter, {opacity: 100}, ">");

            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // final s types induce
        props.output.saInduceS.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSFinal"]));
            const saCell = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_name_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCell, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCell, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight,});
            // timeline.to(saCell, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceSFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");

            // timeline.set("#s" + currentCounter, {opacity: 100}, ">");
            // timeline.set("#s" + (currentCounter - 1), {opacity: 0}, ">");
            timeline.to("#s" + currentCounter, {opacity: 100}, ">");

            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        timeline.call(() => props.setActiveLineIds(["return"]));
        // display each suffix individually
        props.output.sa.forEach(() => {
            timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {duration: 0.2}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        })

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
        }
    }, {dependencies: [props.output.timestamp]});

    let yOffset = 0;

    const xOffsetLeftCol = 10;
    const xOffsetRightCol = 600;
    const rowNameColWidth = 80;
    const strokeWidth = 1;

    const guessesYOffset = 150;
    let counter = 0
    return (
        <div className="algorithm-panel">
            <IOModeTabs mode={"output"}
                        onChangeInput={props.onChangeInput}
                        onSubmit={() => {
                        }}
                        canSubmit={false}/>

            <svg className="algorithm-canvas" viewBox="0 0 1123 700" preserveAspectRatio="xMidYMid meet">
                {/* initial state with indexes and buckets */}
                <IndexRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={30}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                    strokeWidth={strokeWidth}
                />
                <TextRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={60}
                    typeMap={props.output.typeMapDto}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                    strokeWidth={strokeWidth}
                />
                <TypesRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={90}
                    typeMap={props.output.typeMapDto}
                    source={props.output.source}
                    nameColWidth={rowNameColWidth}
                    strokeWidth={strokeWidth}
                />
                {counter++}
                <BucketsRow
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    bucketSizes={props.output.bucketSizes}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={120}
                    nameColWidth={rowNameColWidth}
                    strokeWidth={strokeWidth}
                />
                {counter++}

                {/* empty cells to place sa in */}
                {emptySaSvgElement()}
                {counter++}
                {/* lms guesses */}
                {props.output.guessLmsSteps.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"lms_guess_" + index} key={"lms_guess_" + index}>
                                <rect
                                    id={`s${counter}_cell_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell yellow when suffix is lms
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    // style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                    // style={{opacity: 0}}
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        );
                        // counter++;
                    }

                    const complete = (
                        <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                            {elements}
                        </g>
                    )
                    counter++;
                    return complete;
                })}

                {/* induce L-types guess */}
                {props.output.guessInduceL.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"L_induce_guess_" + index} key={"L_induce_guess_" + index}>
                                <rect
                                    id={`s${counter}_cell_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    // style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                    // style={{opacity: 0}}
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        // counter++;
                    }

                    const complete = (
                        <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                            {elements}
                        </g>
                    )
                    counter++;
                    return complete;
                })}

                {/* induce S-types guess */}
                {props.output.guessInduceS.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"S_induce_guess_" + index} key={"S_induce_guess_" + index}>
                                <rect
                                    id={`s${counter}_cell_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={guessesYOffset}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={guessesYOffset + cellHeight * 0.7}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        // counter++;
                    }
                    const complete = (
                        <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                            {elements}
                        </g>
                    )
                    counter++;
                    return complete;
                })}

                {/* guessed sa */}
                <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                    {props.output.guessedSa.map((offset, index) => (
                        <g key={index}>
                            <rect
                                x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                y={guessesYOffset}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill={(lmsOffsets.includes(offset, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                y={guessesYOffset + cellHeight * 0.7}
                                textAnchor="middle"
                            >
                                {offset}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}

                {/* naming */}
                <g id={"naming_group"} key={"naming group"} transform={`translate(${xOffsetRightCol}, 0)`}>
                    {
                        data.lmsOrder.map((pos, i) => {
                            const height = 30
                            const width = 250;
                            yOffset += 40;

                            const substring = lmsSubstr(pos);
                            const nm = data.lmsNames[pos];
                            const prevNm = i > 0 ? data.lmsNames[data.lmsOrder[i - 1]] : null;
                            const isDup = prevNm !== null && nm === prevNm;

                            const badgeColor = isDup ? COLORS.rose : COLORS.amber;
                            const badgeBg = isDup ? COLORS.roseBg : COLORS.amberBg;
                            const element = (
                                <g
                                    id={"s" + counter}
                                    key={"s" + counter}
                                    style={{opacity: 0}}
                                    transform={`translate(0, ${yOffset})`}
                                >
                                    <rect x={0} y={0} width={width} height={height} fill="white"
                                          stroke="black" strokeWidth={1}/>
                                    <text x={12} y={height / 2} dominantBaseline="central"
                                        // fontFamily="'JetBrains Mono', monospace"
                                        // fontSize={11} fill={COLORS.textMuted}
                                    >
                                        pos {pos}
                                    </text>
                                    <rect x={64} y={8} width={width - 64 - 110} height={height - 16} rx={5}
                                          fill="lightgray"/>
                                    <text x={74} y={height / 2} dominantBaseline="central"
                                        // fontFamily="'JetBrains Mono', monospace"
                                          fontSize={13}
                                        // fill={COLORS.textPrimary}
                                    >
                                        "{substring}"
                                    </text>
                                    <rect x={width - 100} y={6} width={88} height={height - 12} rx={5} fill={badgeBg}
                                          stroke={badgeColor} strokeWidth={0.8}/>
                                    <text
                                        x={width - 56}
                                        y={height / 2}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontFamily="'JetBrains Mono', monospace"
                                        fontSize={12}
                                        fontWeight={600}
                                        fill={badgeColor}
                                    >
                                        name = {nm}
                                    </text>
                                </g>
                            );
                            counter++;
                            return element;
                        })
                    }
                </g>

                {/* reduced */}
                <g
                    id={"s" + counter}
                    key={"s" + counter}
                    transform={`translate(${xOffsetRightCol}, ${yOffset + 50})`}
                    style={{opacity: 0}}
                >
                    {
                        props.output.reduced.map((pos, index) => {
                            return (
                                <g
                                    id={"test_reduced_cell_" + index}
                                    key={"test_reduced_cell_" + index}
                                    transform={`translate(${cellWidth * index}, 0)`}
                                >
                                    <rect
                                        x={0}
                                        y={0}
                                        width={cellWidth}
                                        height={cellHeight}
                                        fill="white"
                                        stroke="black"
                                    />
                                    <text
                                        x={cellWidth / 2}
                                        y={cellHeight * 0.7}
                                        textAnchor="middle"
                                    >
                                        {pos}
                                    </text>
                                </g>
                            )
                        })
                    }
                </g>
                {counter++}

                {/* arrow */}
                <g
                    id={"s" + counter}
                    key={"s" + counter}
                    transform={`translate(${xOffsetRightCol + props.output.reduced.length * (cellWidth + 1) + 5}, ${yOffset + 53})`}
                    style={{opacity: 0}}
                >
                    <path
                        d={`M0 12H${20 + arrowLen}M${20 + arrowLen} 12L${16 + arrowLen} 8M${20 + arrowLen} 12L${16 + arrowLen} 16`}
                        stroke="#000000"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
                {counter++}

                {/* reduced sorted */}
                <g
                    id={"s" + counter}
                    key={"s" + counter}
                    transform={`translate(${xOffsetRightCol + 10 + props.output.reduced.length * (cellWidth + 1) + arrowLen + 25}, ${yOffset + 50})`}
                    style={{opacity: 0}}
                >
                    {
                        props.output.reducedSorted.map((pos, index) => {
                            return (
                                <g
                                    id={"test_reduced_cell_" + index}
                                    key={"test_reduced_cell_" + index}
                                    transform={`translate(${cellWidth * index}, 0)`}
                                >
                                    <rect
                                        x={0}
                                        y={0}
                                        width={cellWidth}
                                        height={cellHeight}
                                        fill="white"
                                        stroke="black"
                                    />
                                    <text
                                        x={cellWidth / 2}
                                        y={cellHeight * 0.7}
                                        textAnchor="middle"
                                    >
                                        {pos}
                                    </text>
                                </g>
                            )
                        })
                    }
                </g>
                {counter++}

                {/* sa Slots */}
                <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                    {props.output.saLmsAdded.map((pos, index) => {
                        const y = 200;
                        return <g key={"lms_slots_ele_" + index}>
                            <rect
                                x={xOffsetLeftCol + rowNameColWidth + index * 30}
                                y={y}
                                width={cellWidth}
                                height={cellHeight}
                                fill={(lmsOffsets.includes(pos, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={xOffsetLeftCol + rowNameColWidth + index * 30 + 15}
                                y={y + 20}
                                textAnchor="middle"
                            >
                                {(pos == -1) ? "" : pos}
                            </text>
                        </g>
                    })
                    }
                </g>
                {counter++}

                {/* induce L-types final */}
                {props.output.saInduceL.map((step, j) => {
                    const y = 200;
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"final_l_induce_ele_" + index} key={"final_l_induce_ele_" + index}>
                                <rect
                                    id={`s${counter}_cell_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * 30}
                                    y={y}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * 30 + 15}
                                    y={y + 20}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        // counter++;
                    }
                    const complete = (
                        <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                            {elements}
                        </g>
                    )
                    counter++;
                    return complete
                })}

                {/* induce S-types final */}
                {props.output.saInduceS.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        const y = 200;
                        elements.push(
                            <g id={"final_s_index_ele" + index} key={"final_s_index_ele" + index}>
                                <rect
                                    id={`s${counter}_cell_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * 30}
                                    y={y}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * 30 + 15}
                                    y={y + 20}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        // counter++;
                    }
                    const complete = (
                        <g id={"s" + counter} k={"s" + counter} style={{opacity: 0}}>
                            {elements}
                        </g>
                    )
                    counter++;
                    return complete;
                })}
                {/* final suffix */}
                <g id={"final_suffixes"}>
                    {
                        props.output.sa.map((offset, index) => {
                            const y = 270;
                            const group = (<g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                                    <text
                                        x={xOffsetLeftCol + rowNameColWidth + 20}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {index}
                                    </text>
                                    <text
                                        x={xOffsetLeftCol + rowNameColWidth + 20 + 30}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {offset}
                                    </text>
                                    <text
                                        x={xOffsetLeftCol + rowNameColWidth + 20 + 60}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {props.output.source.substring(offset)}
                                    </text>
                                </g>
                            );
                            counter++;
                            return group;
                        })
                    }
                </g>
            </svg>

            {/* output control */}
            <OutputControls
                timelineRef={tlRef}
                labels={labels}
                currentStep={props.stepIndex}
                setCurrentStep={props.setStepIndex}
                stepCount={counter}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.progress}
                setProgress={props.setProgress}
                playbackSpeed={playbackSpeed}
                onPlaybackSpeedChange={changePlaybackSpeed}
            />
            {/* step info */}
            <div className="step-info">
                <div className="step-info-grid">
                    <div><strong>Step:</strong> {props.stepIndex} / {labels.length - 1}</div>
                </div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_SAIS}
                activeLineIds={props.activeLineIds}
                title={"Suffix Array Induced Sorting PseudoCode"}
            />

            {/*<text>{JSON.stringify(props.output)}</text>*/}
        </div>
    );

    // return (
    //     <div className="algorithm-panel">
    //         <IOModeTabs mode={"output"}
    //                     onChangeInput={props.onChangeInput}
    //                     onSubmit={() => {
    //                     }}
    //                     canSubmit={false}/>
    //         <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
    //             {steps.map((step, i) => (
    //                 <div id={"s" + i} key={"s" + i}>
    //                     {/*<VisualForStep step={step} data={data}/>*/}
    //                 </div>
    //             ))}
    //         </svg>
    //     </div>
    // );
}