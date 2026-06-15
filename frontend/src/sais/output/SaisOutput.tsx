import type {SaisOutputProps} from "../shared/Types.tsx";
import {useRef, useState} from "react";
import gsap from "gsap";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";

export function SaisOutput(props: SaisOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const getLmsOffsets = () => {
        const offsets = []
        for (let offset = 0; offset < props.output.source.length; offset++) {
            if (props.output.typeMapDto.map[offset].isLms) {
                offsets.push(offset);
            }
        }
        return offsets;
    }
    //
    const lmsOffsets = getLmsOffsets();

    console.log(props.output);

    const cellWidth = 30
    const cellHeight = 30
    const boxCount = props.output.source.length;
    const arrowXStart = 10 + 10 + props.output.reduced.length * cellWidth
    const arrowXEnd = 180 + props.output.reduced.length * cellWidth
    const arrowTextX = (arrowXStart + arrowXEnd) / 2

    let currentX = 10;
    let counter = 0
    return (
        <div className="algorithm-panel">
            <IOModeTabs mode={"output"}
                        onChangeInput={props.onChangeInput}
                        onSubmit={() => {
                        }}
                        canSubmit={false}/>

            <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
                {/*<text x={10} y={10}>{JSON.stringify(props.output)}</text>*/}
                {/*<foreignObject x={10} y={30} width={100} height={150}>*/}
                {/*    <table>*/}
                {/*        <tbody>*/}
                {/*        <tr>*/}
                {/*            {[...props.output.source].map((char, index) => (*/}
                {/*                <th>{char}</th>*/}
                {/*            ))}*/}
                {/*        </tr>*/}
                {/*        </tbody>*/}
                {/*    </table>*/}
                {/*</foreignObject>*/}

                {/* initial state with indexes and buckets */}
                {[...props.output.source].map((_, index) => (
                    <g key={index}>
                        <rect
                            x={10 + index * 30}
                            y={30}
                            width={cellWidth}
                            height={cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
                            x={10 + index * 30 + 15}
                            y={50}
                            textAnchor="middle"
                        >
                            {index}
                        </text>
                    </g>
                ))}
                {[...props.output.source].map((char, index) => (
                    <g key={index}>
                        <rect
                            x={10 + index * 30}
                            y={60}
                            width={cellWidth}
                            height={cellHeight}
                            // fill cell yellow when suffix is lms
                            fill={(props.output.typeMapDto.map[index].isLms) ? "yellow" : "white"}
                            stroke="black"
                        />
                        <text
                            x={10 + index * 30 + 15}
                            y={80}
                            textAnchor="middle"
                        >
                            {char}
                        </text>
                    </g>
                ))}
                {[...props.output.source].map((_, index) => (
                    <g key={index}>
                        <rect
                            x={10 + index * 30}
                            y={90}
                            width={cellWidth}
                            height={cellHeight}
                            // fill cell yellow when suffix is lms
                            fill={(props.output.typeMapDto.map[index].isLms) ? "yellow" : "white"}
                            stroke="black"
                        />
                        <text
                            x={10 + index * 30 + 15}
                            y={110}
                            textAnchor="middle"
                        >
                            {props.output.typeMapDto.map[index].type}
                        </text>
                    </g>
                ))}
                {props.output.bucketSizes.flatMap((bucket) => {
                    const elements = [];

                    for (let i = 0; i < bucket.size; i++) {
                        const x = currentX;
                        elements.push(
                            <g key={`${bucket.c}-${i}`}>
                                <rect
                                    x={x}
                                    y={120}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill="white"
                                    stroke="black"
                                />
                                <text
                                    x={x + cellWidth / 2}
                                    y={140}
                                    textAnchor="middle"
                                >
                                    {bucket.c}
                                </text>
                            </g>
                        );

                        currentX += cellWidth;
                    }

                    return elements;
                })}

                {/* lms guesses */}
                {props.output.guessLmsSteps.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter}>
                                <rect
                                    x={10 + index * 30}
                                    y={170}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell yellow when suffix is lms
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={10 + index * 30 + 15}
                                    y={190}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }

                    return elements;
                })}
                {/* induce L-types guess */}
                {props.output.guessInduceL.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter} style={{opacity: 1}}>
                                <rect
                                    x={10 + index * 30}
                                    y={170}
                                    width={cellWidth}
                                    height={cellHeight}
                                    // fill cell lightblue when it's the newly inserted one
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={10 + index * 30 + 15}
                                    y={190}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements
                })}
                {/* induce S-types guess */}
                {props.output.guessInduceS.map((step, j) => {
                    const elements = [];
                    for (let index = 0; index < boxCount; index++) {
                        elements.push(
                            <g id={"s" + counter} key={"s" + counter}>
                                <rect
                                    x={10 + index * 30}
                                    y={170}
                                    width={cellWidth}
                                    height={cellHeight}
                                    fill={(index === step.bucketIndex) ? "lightblue" : "white"}
                                    stroke="black"
                                />
                                <text
                                    x={10 + index * 30 + 15}
                                    y={190}
                                    textAnchor="middle"
                                >
                                    {(step.resultingArray[index] != -1) ? step.resultingArray[index] : ""}
                                </text>
                            </g>
                        )
                        counter++;
                    }
                    return elements;
                })}

                {/* guessed sa */}
                <g id={"s" + counter} key={"s" + counter}>
                    {props.output.guessedSa.map((offset, index) => (
                        <g key={index}>
                            <rect
                                x={10 + index * 30}
                                y={170}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill={(lmsOffsets.includes(offset, 0)) ? "yellow" : "white"}
                                stroke="black"
                            />
                            <text
                                x={10 + index * 30 + 15}
                                y={190}
                                textAnchor="middle"
                            >
                                {offset}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}

                {/* name lms */}
                {/* list lms */}
                <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                    {props.output.lmsOrder.map((lms, index) => (
                        <g key={lms}>
                            <text
                                x={20}
                                y={240 + index * 30}
                            >
                                {lms}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}
                {/* lms with names */}
                <g id={"s" + counter} key={"s" + counter} style={{opacity: 0}}>
                    {props.output.lmsOrder.map((lms, index) => (
                        <g key={lms}>
                            <text
                                x={20}
                                y={240 + index * 30}
                            >
                                {lms}
                            </text>
                            <text
                                x={60}
                                y={240 + index * 30}
                            >
                                {"->"}
                            </text>
                            <text
                                x={100}
                                y={240 + index * 30}
                            >
                                {props.output.lmsNames[lms]}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}
                {/* lms names in text order */}
                <g id={"s" + counter} key={"s" + counter}>
                    {props.output.lmsPositions.map((lms, index) => (
                        <g key={lms}>
                            <text
                                x={20}
                                y={240 + index * 30}
                            >
                                {lms}
                            </text>
                            <text
                                x={60}
                                y={240 + index * 30}
                            >
                                {"->"}
                            </text>
                            <text
                                x={100}
                                y={240 + index * 30}
                            >
                                {props.output.lmsNames[lms]}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}

                {/* reduced sa */}
                <g id={"s" + counter} key={"s" + counter}>
                    <text
                        x={10}
                        y={360}
                    >
                        reduced suffix array:
                    </text>
                    {props.output.reduced.map((offset, index) => (
                        <g key={index}>
                            <rect
                                x={10 + index * 30}
                                y={370}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill="white"
                                stroke="black"
                            />
                            <text
                                x={10 + index * 30 + 15}
                                y={390}
                                textAnchor="middle"
                            >
                                {offset}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}

                {/* sorted reduced sa */}
                <g id={"s" + counter} key={"s" + counter}>
                    {/* arrow with sorted text */}
                    <text
                        x={arrowTextX}
                        y={380}
                        textAnchor="middle"
                    >
                        sort reduced
                    </text>
                    <line
                        x1={arrowXStart}
                        y1={370 + cellHeight / 2}
                        x2={arrowXEnd}
                        y2={370 + cellHeight / 2}
                        stroke="black"
                        strokeWidth={2}
                    />
                    <polygon
                        points={arrowXEnd + "," + (370 + cellHeight / 2) + " " + (arrowXEnd - 10) + "," + (370 + cellHeight / 2 - 5) + " " + (arrowXEnd - 10) + "," + (370 + cellHeight / 2 + 5)}
                        fill="black"
                    />
                    {/* actual sorted reduced sa */}
                    {props.output.reducedSorted.map((offset, index) => (
                        <g key={index}>
                            <rect
                                x={10 + arrowXEnd + index * 30}
                                y={370}
                                width={cellWidth}
                                height={cellHeight}
                                // fill cell yellow when suffix is lms
                                fill="white"
                                stroke="black"
                            />
                            <text
                                x={10 + arrowXEnd + index * 30 + 15}
                                y={390}
                                textAnchor="middle"
                            >
                                {offset}
                            </text>
                        </g>
                    ))}
                </g>
                {counter++}
            </svg>

            {/* step info */}
            <div className="step-info">
                <div className="step-description">a step description</div>
            </div>

            <text>{JSON.stringify(props.output)}</text>
        </div>
    )
}