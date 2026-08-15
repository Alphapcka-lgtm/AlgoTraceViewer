import type {SaisOutputProps} from "../shared/Types.tsx";
import {useMemo, useRef, useState} from "react";
import gsap from "gsap";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {BucketsRow} from "../shared/BucketsRow.tsx";
import {TypesRow} from "../shared/TypesRow.tsx";
import {TextRow} from "../shared/TextRow.tsx";
import {IndexRow} from "../shared/IndexRow.tsx";
import {createStepLabels, getCurrentTimelineStepIndex, SVG_HEIGHT, SVG_WIDTH} from "../../shared/Utils.tsx";
import {useGSAP} from "@gsap/react";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {PSEUDOCODE_SAIS, SAIS_COLORS} from "./PseudoCode.tsx";
import {ReducedString} from "../shared/ReducedString.tsx";
import {ReducedSortedString} from "../shared/ReducedSortedString.tsx";
import {EmptySuffixArray} from "../shared/EmptySuffixArray.tsx";
import {LmsPositions} from "../shared/LmsPositions.tsx";
import {CurrentInduceSeedIcon, LastPlacedSuffixIcon, LegendEntry, LmsIcon} from "../../LegendeEntry.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";

const STEP_DURATION = 1.0;

export function SaisOutput(props: SaisOutputProps) {
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
        bg: SAIS_COLORS.amberBg,
        color: SAIS_COLORS.amber,
        ringColor: SAIS_COLORS.amber,
        bold: true,
    }));
    data.reducedSorted.map((ri) => ({
        label: String(ri),
        sub: `→ pos ${data.lmsPositions[ri]}`,
        bg: SAIS_COLORS.violetBg,
        color: SAIS_COLORS.violet,
        ringColor: SAIS_COLORS.violet,
    }));

    const cellWidth = 30
    const cellHeight = 30
    const boxCount = props.output.source.length;
    const arrowLen = 10;
    const xOffsetLeftCol = 10;
    const xOffsetRightCol = 600;
    const rowNameColWidth = 80;
    const xOffsetNamingStuff = xOffsetLeftCol + rowNameColWidth;
    const reducedNameColWidth = 80;
    const strokeWidth = 1;
    const saYPosition = 150;

    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const labels = createStepLabels(
        1
        + 1 // one step for displaying types
        + 1 // one stop for displaying buckets
        + 1 // one for empty sa
        + props.output.guessLmsSteps.length
        + props.output.guessInduceL.length
        + props.output.guessInduceS.length
        + 1 // for the final guessed sa
        + props.output.lmsOrder.length
        + 1 // +1 for lms positions
        + 2 // +1 for reduced sa, +1 for sorted reduced sa
        + 1 // for empty suffix array
        + props.output.lmsSortSteps.length
        + props.output.saInduceL.length
        + props.output.saInduceS.length
        + 1 // to displays the suffixes
    );

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
                props.cProps.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getCurrentTimelineStepIndex(tl, labels);

                props.cProps.setCurrentStepIndex(stepIndex);
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
                props.setStepDescription({
                    title: "Classify S-type / L-type positions",
                    description: `Each position is S-type if its suffix is lexicographically smaller than the next position's suffix, or L-type if larger. Positions marked LMS(Left-Most S-type) are L→S transitions and anchor the whole algorithm.`
                })
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
                props.setStepDescription({
                    title: "Create character buckets",
                    description: `Count how many times each character appears in the source string. Each unique character gets a contiguous range of slots in the suffix array — its bucket. L-type suffixes fill from the bucket head (left), S-type suffixes from the tail (right). The sentinel $ always occupies slot 0 alone.`
                });
            });
            timeline.to("#buckets_row", {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display empty suffix array
        {
            timeline.call(() => {
                props.setActiveLineIds(["saInit"]);
                props.setStepDescription({
                    title: "Create empty suffix array",
                    description: `Create the empty suffix array with the length of the word and including the empty word`
                });
            });
            timeline.to(`#empty_sa${currentCounter}`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms guess steps
        timeline.call(() => {
            props.setActiveLineIds(["lmsGuess"]);
            props.setStepDescription({
                title: "Roughly place LMS suffixes",
                description: `Scanning left to right, each LMS position is dropped at the current tail of its character's bucket. This rough pass just seeds the next two induction passes — order isn't correct yet.`
            })
        });
        props.output.guessLmsSteps.forEach((step) => {
            const wordCell = `#text_row_rect_${step.sourceIndex}`;
            const indexCell = `#index_row_rect_${step.sourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_cell_${step.bucketIndex}`;

            const originalFill = gsap.getProperty(wordCell, "fill");

            timeline.to(indexCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(wordCell, {fill: SAIS_COLORS.cellHighlight}, "<");
            timeline.to("#s" + currentCounter, {opacity: 1});

            timeline.addLabel(labels[currentCounter + 1]);

            // remove highlighting
            timeline.to(indexCell, {fill: "white"});
            timeline.to(wordCell, {fill: originalFill}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");
            currentCounter++;
        });

        // L induce steps
        timeline.call(() => props.setStepDescription({
            title: "Induce L-type suffixes",
            description: `Scanning the array left to right: whenever a slot holds position p and p−1 is L-type, place p−1 at the current head of its bucket.`
        }));
        props.output.guessInduceL.forEach((step) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLGuess"]));
            const seedCellPrev = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const seedCellCurrent = `#s${currentCounter}_cell_${step.induceSaIndex}`;
            const seedIndexCell = `#index_row_rect_${step.seedSourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_cell_${step.bucketIndex}`;
            const indexCell = `#index_row_rect_${step.sourceIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;

            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(seedCellPrev, {fill: SAIS_COLORS.seedCellHighlight});
            timeline.to(seedIndexCell, {fill: SAIS_COLORS.seedCellHighlight}, "<");

            timeline.to(wordCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(indexCell, {fill: SAIS_COLORS.cellHighlight}, "<");

            timeline.call(() => props.setActiveLineIds(["placeInduceLGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(seedCellCurrent, {fill: SAIS_COLORS.seedCellHighlight, duration: 0}, "<");
            timeline.addLabel(labels[currentCounter + 1]);

            // remove highlighting
            timeline.to(wordCell, {fill: fillWordCell});
            timeline.to(indexCell, {fill: "white"}, "<");
            timeline.to(seedCellCurrent, {fill: "white"}, "<");
            timeline.to(seedIndexCell, {fill: "white"}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");

            currentCounter++;
        });

        // S induce steps
        timeline.call(() => props.setStepDescription({
            title: "Induce S-type suffixes",
            description: "Scanning right to left: whenever a slot holds position p and p−1 isS-type, place p−1 at the current tail of its bucket. After this pass, LMS suffixes sit in correct relative order."
        }));
        props.output.guessInduceS.forEach((step) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSGuess"]));
            const seedCellPrev = `#s${currentCounter - 1}_cell_${step.induceSaIndex}`;
            const seedCellCurrent = `#s${currentCounter}_cell_${step.induceSaIndex}`;
            const seedIndexCell = `#index_row_rect_${step.seedSourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_cell_${step.bucketIndex}`;
            const indexCell = `#index_row_rect_${step.sourceIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;

            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(seedCellPrev, {fill: SAIS_COLORS.seedCellHighlight});
            timeline.to(seedCellCurrent, {fill: SAIS_COLORS.seedCellHighlight}, "<");

            timeline.to(wordCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(indexCell, {fill: SAIS_COLORS.cellHighlight}, "<");

            timeline.call(() => props.setActiveLineIds(["placeInduceSGuess"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(seedCellCurrent, {fill: SAIS_COLORS.seedCellHighlight, duration: 0}, "<");
            timeline.addLabel(labels[currentCounter + 1]);

            // remove highlighting
            timeline.to(wordCell, {fill: fillWordCell});
            timeline.to(indexCell, {fill: "white"}, "<");
            timeline.to(seedCellCurrent, {fill: "white"}, "<");
            timeline.to(seedIndexCell, {fill: "white"}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");

            currentCounter++;
        });

        // guessed suffix array
        {
            timeline.to("#s" + currentCounter, {opacity: 100});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // lms names
        timeline.call(() => {
            props.setActiveLineIds(["assignName"]);
            props.setStepDescription({
                title: "Name each LMS substring",
                description: `Using the sorted LMS order just found, compare each LMS substring (from one LMS position to the next, inclusive) to its predecessor: identical → same name, different → next name.`
            });
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
                props.setStepDescription({
                    title: "Store LMS Positions",
                    description: `Store the LMS Position the way they appear in the string to later look up which LMS needs to slotted into the suffix array.`
                });
            })
            timeline.to(`#lms_positions`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // display reduced sa
        timeline.call(() => {
            props.setActiveLineIds(["reduced"]);
            props.setStepDescription({
                title: "Reduced string",
                description: `Write the assigned names in the order their LMS positions occur in the original word.`
            });
        });
        {
            // timeline.set("#s" + currentCounter, {opacity: 100});
            timeline.to(`#reduced_string`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        timeline.call(() => {
            props.setStepDescription({
                title: "Recursion check",
                description: "If every name is unique, the order is already known. If two LMS substrings share a name, the backend recurses SA-IS on this reduced string to resolve the tie."
            })
        })
        // display arrow and sorted reduced sa
        {
            timeline.to(`#sorting_arrow`, {opacity: 1});
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
            props.setStepDescription({
                title: "Place LMS suffixes in correct order",
                description: "Using the correct LMS order from the sorted reduced suffix array, scan right-to-left and place each LMS suffix at the current tail of its character bucket."
            });
        });
        {
            timeline.to(`#empty_sa${currentCounter}`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        // final lms slotting
        timeline.call(() => props.setActiveLineIds(["forEachFinalLms", "finalLmsOffset", "finalLmsPlace"]));
        props.output.lmsSortSteps.forEach((step) => {
            const reducedNameCell = `#reduced_sorted_elem_rect_${step.sortedReducedIndex}`;
            const lmsPosCell = `#lms_positions_rect_${step.lmsIndex}`
            const indexRowCell = `#index_row_rect_${step.sourceIndex}`;
            const textRowCell = `#text_row_rect_${step.sourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_rect_${step.bucketIndex}`;

            const reducedNameCellColor = gsap.getProperty(reducedNameCell, "fill");
            const lmsPosCellColor = gsap.getProperty(lmsPosCell, "fill");
            const indexRowCellColor = gsap.getProperty(indexRowCell, "fill");
            const textRowCellColor = gsap.getProperty(textRowCell, "fill");

            timeline.to(reducedNameCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(lmsPosCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(indexRowCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(textRowCell, {fill: SAIS_COLORS.cellHighlight}, "<");

            timeline.to(`#s${currentCounter}`, {opacity: 1});

            timeline.addLabel(labels[currentCounter + 1]);

            // remove all highlighting
            timeline.to(reducedNameCell, {fill: reducedNameCellColor});
            timeline.to(lmsPosCell, {fill: lmsPosCellColor}, "<");
            timeline.to(indexRowCell, {fill: indexRowCellColor}, "<");
            timeline.to(textRowCell, {fill: textRowCellColor}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");

            currentCounter++;
        });

        // final l types induce
        timeline.call(() => props.setStepDescription({
            title: "Final induce L-types",
            description: "Same induction rule as before, now seeded with the correctly ordered LMS suffixes."
        }));
        props.output.saInduceL.forEach((step) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceLFinal"]));
            const seedCellPrev = `#s${currentCounter - 1}_rect_${step.induceSaIndex}`;
            const seedCellCurrent = `#s${currentCounter}_rect_${step.induceSaIndex}`;
            const seedIndexCell = `#index_row_rect_${step.seedSourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_rect_${step.bucketIndex}`;
            const indexCell = `#index_row_rect_${step.sourceIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;

            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(seedCellPrev, {fill: SAIS_COLORS.seedCellHighlight});
            timeline.to(seedIndexCell, {fill: SAIS_COLORS.seedCellHighlight}, "<");

            timeline.to(wordCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(indexCell, {fill: SAIS_COLORS.cellHighlight}, "<");

            timeline.call(() => props.setActiveLineIds(["placeInduceLFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(seedCellCurrent, {fill: SAIS_COLORS.seedCellHighlight, duration: 0}, "<");

            timeline.addLabel(labels[currentCounter + 1]);

            // remove highlighting
            timeline.to(wordCell, {fill: fillWordCell});
            timeline.to(indexCell, {fill: "white"}, "<");
            timeline.to(seedCellCurrent, {fill: "white"}, "<");
            timeline.to(seedIndexCell, {fill: "white"}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");

            currentCounter++;
        });

        // final s types induce
        timeline.call(() => props.setStepDescription({
            title: "Final induce S-types",
            description: "Same induction rule as before, now seeded with the correctly ordered LMS suffixes."
        }));
        props.output.saInduceS.forEach((step) => {
            timeline.call(() => props.setActiveLineIds(["forEachInduceSFinal"]));
            const seedCellPrev = `#s${currentCounter - 1}_rect_${step.induceSaIndex}`;
            const seedCellCurrent = `#s${currentCounter}_rect_${step.induceSaIndex}`;
            const seedIndexCell = `#index_row_rect_${step.seedSourceIndex}`;
            const saPlacedCell = `#s${currentCounter}_rect_${step.bucketIndex}`;
            const indexCell = `#index_row_rect_${step.sourceIndex}`;
            const wordCell = `#text_row_rect_${step.sourceIndex}`;

            const fillWordCell = gsap.getProperty(wordCell, "fill");

            timeline.to(seedCellPrev, {fill: SAIS_COLORS.seedCellHighlight});
            timeline.to(seedIndexCell, {fill: SAIS_COLORS.seedCellHighlight}, "<");

            timeline.to(wordCell, {fill: SAIS_COLORS.cellHighlight});
            timeline.to(indexCell, {fill: SAIS_COLORS.cellHighlight}, "<");

            timeline.call(() => props.setActiveLineIds(["placeInduceSFinal"]));
            timeline.to("#s" + currentCounter, {opacity: 1});
            timeline.to(seedCellCurrent, {fill: SAIS_COLORS.seedCellHighlight, duration: 0}, "<");

            timeline.addLabel(labels[currentCounter + 1]);

            // remove highlighting
            timeline.to(wordCell, {fill: fillWordCell});
            timeline.to(indexCell, {fill: "white"}, "<");
            timeline.to(seedCellCurrent, {fill: "white"}, "<");
            timeline.to(seedIndexCell, {fill: "white"}, "<");
            timeline.to(saPlacedCell, {fill: "white"}, "<");

            currentCounter++;
        });

        timeline.call(() => {
            props.setActiveLineIds(["return"]);
            props.setStepDescription({title: "Suffix Array has been created", description: ""});
        });
        {
            timeline.to(`#final_suffixes`, {opacity: 1});
            timeline.addLabel(labels[currentCounter + 1]);
            currentCounter++;
        }

        void timeline.progress(props.cProps.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
        }
    }, {dependencies: [props.output.timestamp]});

    let yOffset = 160;
    let counter = 0
    return (
        <div className="algorithm-panel">
            <IOModeTabs
                mode={"output"}
                onChangeInput={props.cProps.onChangeInput}
                onSubmit={() => {
                }}
                canSubmit={false}
            />

            <svg
                className="algorithm-canvas"
                viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                preserveAspectRatio="xMidYMid meet"
            >
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
                {props.output.guessLmsSteps.map((step) => {
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
                {props.output.guessInduceL.map((step) => {
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
                {props.output.guessInduceS.map((step) => {
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
                <g id={"naming_group"} key={"naming group"} transform={`translate(${xOffsetNamingStuff}, 0)`}>
                    {
                        data.lmsOrder.map((pos, i) => {
                            const height = 30
                            const width = 255;
                            yOffset += 40;

                            const substring = lmsSubstr(pos);
                            const nm = data.lmsNames[pos];
                            const prevNm = i > 0 ? data.lmsNames[data.lmsOrder[i - 1]] : null;
                            const isDup = prevNm !== null && nm === prevNm;

                            const badgeColor = isDup ? SAIS_COLORS.rose : SAIS_COLORS.amber;
                            const badgeBg = isDup ? SAIS_COLORS.roseBg : SAIS_COLORS.amberBg;
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
                                    <rect x={69} y={8} width={width - 64 - 110} height={height - 16} rx={5}
                                          fill="lightgray"/>
                                    <text x={79} y={height / 2} dominantBaseline="central"
                                        // fontFamily="'JetBrains Mono', monospace"
                                          fontSize={13}
                                        // fill={COLORS.textPrimary}
                                    >
                                        "{substring}"
                                    </text>
                                    <rect x={width - 95} y={6} width={88} height={height - 12} rx={5} fill={badgeBg}
                                          stroke={badgeColor} strokeWidth={0.8}/>
                                    <text
                                        x={width - 51}
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
                    xOffsetStart={xOffsetNamingStuff}
                    yPos={yOffset + 50}
                    lmsPositions={props.output.lmsPositions}
                    nameColWidth={120}
                />
                {counter++}

                <ReducedString
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    xOffsetStart={xOffsetNamingStuff}
                    yPos={yOffset + 100}
                    lmsPositions={props.output.lmsPositions}
                    reduced={props.output.reduced}
                    nameColWidth={reducedNameColWidth}
                />
                {counter++}

                {/* arrow */}
                <g
                    id={`sorting_arrow`}
                    transform={`translate(${xOffsetNamingStuff + props.output.reduced.length * (cellWidth + 1) + 5 + reducedNameColWidth}, ${yOffset + 100 + cellHeight / 2 - 11})`}
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
                    xOffsetStart={xOffsetNamingStuff + 10 + props.output.reduced.length * (cellWidth + 1) + arrowLen + 25 + reducedNameColWidth}
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
                    props.output.lmsSortSteps.map((step) => {
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
                {props.output.saInduceL.map((step) => {
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
                        );
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
                {props.output.saInduceS.map((step) => {
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
                        );
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
                            const y = 50;
                            const group = (<g id={`suffix${index}`} key={`suffix${index}`} style={{opacity: 1}}>
                                    <text
                                        x={xOffsetRightCol + rowNameColWidth + 20}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {index}
                                    </text>
                                    <text
                                        x={xOffsetRightCol + rowNameColWidth + 20 + 30}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {offset}
                                    </text>
                                    <text
                                        x={xOffsetRightCol + rowNameColWidth + 20 + 60}
                                        y={y + index * 30}
                                        textAnchor="start"
                                    >
                                        {props.output.source.substring(offset)}
                                    </text>
                                </g>
                            );
                            return group;
                        })
                    }
                </g>
                {counter++}
            </svg>

            {/* output control */}
            <OutputControls
                timelineRef={tlRef}
                labels={labels}
                currentStep={props.cProps.currentStepIndex}
                setCurrentStep={props.cProps.setCurrentStepIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                progress={props.cProps.progress}
                setProgress={props.cProps.setProgress}
            />
            {/* step info */}
            <div className="step-info sais-step-info-height">
                <div className="step-info-grid sais-step-summary">
                    <div><strong>Step:</strong> {props.cProps.currentStepIndex} / {labels.length - 1}</div>
                </div>
                <div className="step-info-grid sais-legend-grid sais-legend-grid--spaced">
                    <LegendEntry label={"Left-Most-S-Type"} value={""} icon={<LmsIcon/>}/>
                    <LegendEntry label={"Last Placed Suffix"} value={""} icon={<LastPlacedSuffixIcon/>}/>
                    <LegendEntry label={"Current Induce Seed"} value={""} icon={<CurrentInduceSeedIcon/>}/>
                </div>
                <div className="sais-step-text">
                    <div><strong>{props.stepDescription.title}</strong></div>
                    <div>{props.stepDescription.description}</div>
                </div>
            </div>
            <div className="step-layout-actions">
                <ImportExportDialog onImport={props.cProps.onImport} createExportString={props.cProps.createExportString}/>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_SAIS}
                activeLineIds={props.activeLineIds}
            />
            {/*<text>{JSON.stringify(props.output)}</text>*/}
        </div>
    );
}