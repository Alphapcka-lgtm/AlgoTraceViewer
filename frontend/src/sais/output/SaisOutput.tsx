import type {SaisOutputProps} from "../shared/Types.tsx";
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
import {ReducedString} from "../shared/ReducedString.tsx";
import {ReducedSortedString} from "../shared/ReducedSortedString.tsx";
import {EmptySuffixArray} from "../shared/EmptySuffixArray.tsx";
import {LmsPositions} from "../shared/LmsPositions.tsx";

// TODO: export
const STEP_DURATION = 1.0;

export function SaisOutput(props: SaisOutputProps) {
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

    const data = props.output;
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

    data.lmsPositions.map((pos, i) => ({
        label: String(data.reduced[i]),
        sub: `pos ${pos}`,
        bg: COLORS.amberBg,
        color: COLORS.amber,
        ringColor: COLORS.amber,
        bold: true,
    }));
    data.reducedSorted.map((ri) => ({
        label: String(ri),
        sub: `→ pos ${data.lmsPositions[ri]}`,
        bg: COLORS.violetBg,
        color: COLORS.violet,
        ringColor: COLORS.violet,
    }));

    const cellWidth = 30
    const cellHeight = 30
    const boxCount = props.output.source.length;
    const arrowLen = 10;
    const xOffsetLeftCol = 10;
    const xOffsetRightCol = 600;
    const rowNameColWidth = 80;
    const reducedNameColWidth = 80;
    const strokeWidth = 1;
    const saYPosition = 150;

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
        + 2 // +1 for reduced sa, +1 for sorted reduced sa
        + 1 // for empty suffix array
        + props.output.lmsSortSteps.length
        + props.output.saInduceL.length
        + props.output.saInduceS.length
        + 1 // to displays the suffixes
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

        let currentCounter = 0;
        // display types
        {
            timeline.call(() => {
                props.setActiveLineIds(["typeMap"]);
                props.setStepDescription(`Each position is S-type if its suffix is lexicographically smaller than the next position's suffix, or L-type if larger. Positions marked LMS(Left-Most S-type) are L→S transitions and anchor the whole algorithm.`)
            });
            timeline.to("#types_row", {opacity: 1});
            timeline.to(`#text_row1`, {opacity: 1}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display buckets
        {
            timeline.call(() => {
                props.setActiveLineIds(["buckets"]);
                props.setStepDescription(`Count how many times each character appears in the source string. Each unique character gets a contiguous range of slots in the suffix array —its bucket. L-type suffixes fill from the bucket head (left), S-type suffixes from the tail (right). The sentinel $ always occupies slot 0 alone.`);
            });
            timeline.to("#buckets_row", {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display empty suffix array
        {
            timeline.call(() => {
                props.setActiveLineIds(["saInit"]);
                props.setStepDescription(`Create the empty suffix array with the length of the word and including the empty word`);
            });
            timeline.to(`#empty_sa${currentCounter}`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms guess steps
        timeline.call(() => {
            props.setActiveLineIds(["lmsGuess"]);
            props.setStepDescription(`Scanning left to right, each LMS position is dropped at the current tail of its character's bucket. This rough pass just seeds the next two induction passes — order isn't correct yet.`)
        });
        props.output.guessLmsSteps.forEach((step, index) => {
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            let originalFill = gsap.getProperty(wordCell, "fill");
            timeline.to(wordCell, {
                fill: COLORS.cellHighlight,
            });
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(wordCell, {
                fill: originalFill,
            });
            timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {
                fill: "white",
            }, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // L induce steps
        timeline.call(() => props.setStepDescription(`Scanning the array left to right: whenever a slot holds position p and p−1 is L-type, place p−1 at the current head of its bucket.`));
        props.output.guessInduceL.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLGuess"]));
            const saCellPrev = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const saCellCurrent = `#s${currentCounter}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCellPrev, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCellPrev, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight});
            // timeline.to(saCellPrev, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceLGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(saCellCurrent, {fill: COLORS.violet}, "<");
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // S induce steps
        timeline.call(() => props.setStepDescription("Scanning right to left: whenever a slot holds position p and p−1 isS-type, place p−1 at the current tail of its bucket. After this pass, LMS suffixes sit in correct relative order."));
        props.output.guessInduceS.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSGuess"]));
            const saCellPrev = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const saCellCurrent = `#s${currentCounter}_cell_${step.induceSaIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCellPrev, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCellPrev, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight,});
            // timeline.to(saCellPrev, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceSGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(saCellCurrent, {fill: COLORS.violet}, "<");
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // guessed suffix array
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            // timeline.set("#s" + (currentCounter - 1), {opacity: 0});
            timeline.to("#s" + currentCounter, {opacity: 100});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms names
        timeline.call(() => {
            props.setActiveLineIds(["assignName"]);
            props.setStepDescription(`Using the sorted LMS order just found, compare each LMS substring (from one LMS position to the next, inclusive) to its predecessor: identical → same name, different → next name.`);
        });
        props.output.lmsOrder.forEach(() => {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // display lms positions
        {
            timeline.call(() => {
                props.setActiveLineIds(["pos"]);
                props.setStepDescription(`Store the LMS Position the way they appear in the string to later look up which LMS needs to slotted into the suffix array.`);
            })
            timeline.to(`#lms_positions`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display reduced sa
        timeline.call(() => {
            props.setActiveLineIds(["reduced"]);
            props.setStepDescription(`Write the assigned names in the order their LMS positions occur in the original word. If every name is unique, the order is already known. If two LMS substrings share a name, the backend recurses SA-IS on this reduced string to resolve the tie`);
        });
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to(`#reduced_string`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display arrow
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to(`#sorting_arrow`, {opacity: 1});
            // timeline.addLabel(labels[currentCounter + 1]);
            // currentCounter++;
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
            timeline.to(`#reduced_sorted_string`, {opacity: 1}, "<");
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // empty suffix array
        timeline.call(() => {
            props.setActiveLineIds(["clearSa"]);
            props.setStepDescription("Using the correct LMS order from the sorted reduced suffix array, scan right-to-left and place each LMS suffix at the current tail of its character bucket.");
        });
        {
            timeline.to(`#empty_sa${currentCounter}`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // final lms slotting
        timeline.call(() => props.setActiveLineIds(["forEachFinalLms", "finalLmsOffset", "finalLmsPlace"]));
        props.output.lmsSortSteps.forEach((step, index) => {
            const reducedNameCell = `#reduced_sorted_elem_rect_${step.sortedReducedIndex}`;
            const lmsPosCell = `#lms_positions_rect_${step.lmsIndex}`
            const indexRowCell = `#index_row_rect_${step.sourceIndex}`;
            const textRowCell = `#text_row_rect_${step.sourceIndex}`;

            const reducedNameCellColor = gsap.getProperty(reducedNameCell, "fill");
            const lmsPosCellColor = gsap.getProperty(lmsPosCell, "fill");
            const indexRowCellColor = gsap.getProperty(indexRowCell, "fill");
            const textRowCellColor = gsap.getProperty(textRowCell, "fill");

            timeline.to(reducedNameCell, {fill: COLORS.cellHighlight});
            timeline.to(lmsPosCell, {fill: COLORS.cellHighlight});
            timeline.to(indexRowCell, {fill: COLORS.cellHighlight});
            timeline.to(textRowCell, {fill: COLORS.cellHighlight}, "<");

            timeline.to(`#s${currentCounter}`, {opacity: 1});
            // remove all highlighting
            timeline.to(reducedNameCell, {fill: reducedNameCellColor});
            timeline.to(lmsPosCell, {fill: lmsPosCellColor}, "<");
            timeline.to(indexRowCell, {fill: indexRowCellColor}, "<");
            timeline.to(textRowCell, {fill: textRowCellColor}, "<");
            timeline.to(`#s${currentCounter}_rect_${step.bucketIndex}`, {fill: "white"}, "<");

            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // final l types induce
        // TODO
        timeline.call(() => props.setStepDescription("Same induction rule as before, now seeded with the correctly ordered LMS suffixes."));
        props.output.saInduceL.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLFinal"]));
            const saCellPrev = `#s${currentCounter - 1}_rect_${step.induceSaIndex}`;
            const saCellCurrent = `#s${currentCounter}_rect_${step.induceSaIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCellPrev, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCellPrev, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight});
            // timeline.to(saCellPrev, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceLFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(saCellCurrent, {fill: COLORS.violet}, "<");
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");

            // timeline.set("#s" + currentCounter, {opacity: 100});
            // timeline.set("#s" + (currentCounter - 1), {opacity: 0}, ">");
            // timeline.to("#s" + currentCounter, {opacity: 100}, ">");

            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        // final s types induce
        // TODO
        timeline.call(() => props.setStepDescription("Same induction rule as before, now seeded with the correctly ordered LMS suffixes."));
        props.output.saInduceS.forEach((step, index) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSFinal"]));
            const saCellPrev = `#s${currentCounter - 1}_rect_${step.induceSaIndex}`;
            const saCellCurrent = `#s${currentCounter}_rect_${step.induceSaIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            const fillSaCell = gsap.getProperty(saCellPrev, "fill");
            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(saCellPrev, {fill: COLORS.violet});
            timeline.to(wordCell, {fill: COLORS.cellHighlight,});
            // timeline.to(saCellPrev, {fill: fillSaCell});

            timeline.call(() => props.setActiveLineIds(["placeInduceSFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(saCellCurrent, {fill: COLORS.violet}, "<");
            timeline.to(wordCell, {fill: fillWordCell});
            // timeline.to(`#s${currentCounter}_cell_${step.bucketIndex}`, {fill: "white"}, "<");

            timeline.to("#s" + currentCounter, {opacity: 100}, ">");

            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        });

        timeline.call(() => {
            props.setActiveLineIds(["return"]);
            props.setStepDescription("Suffix Array created");
        });
        {
            timeline.to(`#final_suffixes`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
        }
    }, {dependencies: [props.output.timestamp]});

    let yOffset = -10;
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
                <EmptySuffixArray
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={saYPosition}
                    boxCount={boxCount}
                    nameColWidth={rowNameColWidth}
                    counter={counter}
                />
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
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell yellow when suffix is lms
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    // style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={saYPosition + cellHeight * 0.7}
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
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                    // style={{opacity: 0}}
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={saYPosition + cellHeight * 0.7}
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
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={saYPosition + cellHeight * 0.7}
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
                                y={saYPosition}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill={(lmsOffsets.includes(offset, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                y={saYPosition + cellHeight * 0.7}
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

                <LmsPositions
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetRightCol}
                    yPos={yOffset + 50}
                    lmsPositions={props.output.lmsPositions}
                    nameColWidth={110}
                />
                {counter++}

                <ReducedString
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetRightCol}
                    yPos={yOffset + 100}
                    lmsPositions={props.output.lmsPositions}
                    reduced={props.output.reduced}
                    nameColWidth={reducedNameColWidth}
                />
                {counter++}

                {/* arrow */}
                <g
                    id={`sorting_arrow`}
                    transform={`translate(${xOffsetRightCol + props.output.reduced.length * (cellWidth + 1) + 5 + reducedNameColWidth}, ${yOffset + 100 + cellHeight / 2 - 11})`}
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

                <ReducedSortedString
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetRightCol + 10 + props.output.reduced.length * (cellWidth + 1) + arrowLen + 25 + reducedNameColWidth}
                    yPos={yOffset + 100}
                    lmsPositions={props.output.lmsPositions}
                    reducedSorted={props.output.reducedSorted}
                    nameColWidth={reducedNameColWidth}
                />
                {counter++}

                {/* empty sa to slot in the lms */}
                <EmptySuffixArray
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetLeftCol}
                    yPos={saYPosition}
                    boxCount={boxCount}
                    nameColWidth={rowNameColWidth}
                    counter={counter}
                />
                {counter++}

                {/*lms slotting*/}
                {
                    props.output.lmsSortSteps.map((step, j) => {
                        const elements = [];
                        for (let index = 0; index < step.resultingSa.length; index++) {
                            elements.push(
                                <g id={`s${counter}_cell_${index}`}>
                                    <rect
                                        id={`s${counter}_rect_${index}`}
                                        x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                        y={saYPosition}
                                        width={cellWidth}
                                        height={cellHeight}
                                        fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                        stroke="black"
                                    />
                                    <text
                                        id={`s${counter}_text_${index}`}
                                        x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                        y={saYPosition + cellHeight * 0.7}
                                        textAnchor="middle"
                                    >
                                        {(step.resultingSa[index] != -1) ? step.resultingSa[index] : ""}
                                    </text>
                                </g>
                            );
                        }
                        const complete = (
                            <g id={`s${counter}`} style={{opacity: 0}}>
                                {elements}
                            </g>
                        );
                        counter++;
                        return complete;
                    })
                }

                {/* induce L-types final */}
                {props.output.saInduceL.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"final_l_induce_ele_" + index} key={"final_l_induce_ele_" + index}>
                                <rect
                                    id={`s${counter}_rect_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={saYPosition + cellHeight * 0.7}
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
                        elements.push(
                            <g id={"final_s_index_ele" + index} key={"final_s_index_ele" + index}>
                                <rect
                                    id={`s${counter}_rect_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellWidth / 2}
                                    y={saYPosition + cellHeight * 0.7}
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
                <g id={"final_suffixes"} style={{opacity: 0}}>
                    {
                        props.output.sa.map((offset, index) => (
                            <g id={`final_sa_cell_${index}`}>
                                <rect
                                    id={`final_sa_rect_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth}
                                    y={saYPosition}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill="white"
                                    stroke="black"
                                />
                                <text
                                    id={`final_sa_text_${index}`}
                                    x={xOffsetLeftCol + rowNameColWidth + index * cellWidth + cellHeight / 2}
                                    y={saYPosition + cellHeight * 0.7}
                                    textAnchor="middle"
                                >
                                    {offset}
                                </text>
                            </g>
                        ))
                    }
                    {
                        props.output.sa.map((offset, index) => {
                            const y = saYPosition + cellHeight + 20;
                            const group = (<g id={"s" + counter} key={"s" + counter} style={{opacity: 1}}>
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
                <div>{props.stepDescription}</div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_SAIS}
                activeLineIds={props.activeLineIds}
                title={"Suffix Array Induced Sorting PseudoCode"}
            />

            {/*<text>{JSON.stringify(props.output)}</text>*/}
        </div>
    );
}