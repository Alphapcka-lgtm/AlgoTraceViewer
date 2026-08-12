import {
    createStepLabels,
    getStepIndexFromTimeline,
    colors,
    getActiveLineIdsMaxDegree,
    PSEUDOCODE_MAX_DEGREE,
    SVG_WIDTH, SVG_HEIGHT
} from "../../shared/Utils.tsx";
import {NodeDegreeMapIcon, NodeIcon, RemainingEdgeIcon, LegendEntry} from "../../LegendeEntry.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import type {SVGOutputProps} from "../shared/Types.tsx";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import {Edges} from "../shared/Edges.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const STEP_DURATION = 1.0;

export function MaxDegreeOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3 * props.output.intermediateStates.length + 3);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
    };

    useGSAP(() => {

        gsap.registerPlugin(DrawSVGPlugin);
        gsap.registerPlugin(ScrambleTextPlugin);

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = timelineRef.current;
                props.setProgress(tl.progress());

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setCurrentStepIndex(stepIndex);
            },
            onComplete: () => {
                props.setProgress(1);
                setIsPlaying(false);
                timelineRef.current.pause();
            },
        });

        timelineRef.current = timeline;

        timeline.addLabel(labels[0]);

        props.output.initialState.edges.forEach((edge, index) => {
            if (index == 0) {
                timeline.set("#u0" + edge.id, {opacity: 100});
            } else {
                timeline.set("#u0" + edge.id, {opacity: 100}, "<");
            }
            timeline.from("#u0" + edge.id, {drawSVG: "50% 50%"}, "<");
        })

        timeline.addLabel(labels[1]);

        props.output.initialDegreeMap.forEach((ndp, index) => {

            if (index === 0) {
                timeline.to("#t2" + ndp.node.id, {
                    scrambleText: {text: String(ndp.degree), chars: "-|"},
                });
            } else {
                timeline.to("#t2" + ndp.node.id, {
                    scrambleText: {text: String(ndp.degree), chars: "-|"},
                }, "<");
            }
        })

        timeline.addLabel(labels[2]);

        props.output.intermediateStates.forEach((intermediateState, index) => {

            intermediateState.chosenNodes.forEach((node) => {
                const tableElement = document.getElementById("t1" + node.id)! as HTMLDivElement;

                timeline.to(tableElement, {
                    background: colors.red,
                    onStart: () => tableElement.scrollIntoView({
                        behavior: "smooth",
                        inline: "center",
                        block: "nearest"
                    })
                });

                timeline.addLabel(labels[3 * index + 3]);

                timeline.to("#u1" + node.id, {r: 20});
                timeline.to("#u2" + node.id, {r: 18}, "<");
                timeline.to("#u3" + node.id, {r: 15}, "<");

                timeline.addLabel(labels[3 * index + 4]);

                intermediateState.incidentEdges.forEach((incidentEdge, index) => {
                    if (index == 0) {
                        if (incidentEdge.fromId === node.id || incidentEdge.fromId === node.id) {
                            timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"});
                        } else {
                            timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"});
                        }
                    } else {
                        if (incidentEdge.fromId === node.id || incidentEdge.fromId === node.id) {
                            timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                        } else {
                            timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                        }
                    }
                });

                const previous = index == 0 ? props.output.initialDegreeMap : props.output.intermediateStates[index-1].degreeMap;
                let first = true;

                intermediateState.degreeMap.forEach((ndp, index) => {
                    if(previous[index].degree != ndp.degree) {
                        if (first) {
                            timeline.to("#t2" + ndp.node.id, {
                                scrambleText: {text: String(ndp.degree), chars: "-|"},
                            });
                            first = false;
                        } else {
                            timeline.to("#t2" + ndp.node.id, {
                                scrambleText: {text: String(ndp.degree), chars: "-|"},
                            }, "<");
                        }
                    }
                })

                timeline.to(tableElement, {background: "none"});
            })

            timeline.addLabel(labels[3 * index + 5]);
        });

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            timelineRef.current = gsap.timeline({paused: true});
        };
    }, {dependencies: [props.output.timestamp]});

    return <div className="algorithm-panel">
        <IOModeTabs
            mode="output"
            onChangeInput={props.onChangeInput}
            onSubmit={() => {
            }}
            canSubmit={false}
        />
        <svg className="algorithm-canvas" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes}/>
            <Nodes nodes={props.output.initialState.nodes}/>
        </svg>
        <OutputControls
            timelineRef={timelineRef}
            labels={labels}
            currentStep={props.currentStepIndex}
            setCurrentStep={props.setCurrentStepIndex}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            progress={props.progress}
            setProgress={props.setProgress}
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={changePlaybackSpeed}
        />
        <div className="step-layout">
            <div className="step-layout-side">
                <div className="step-info">
            <div className="step-info-grid vertex-cover-step-summary">
                <div><strong>Step:</strong> {props.currentStepIndex} / {labels.length - 1}</div>
                <div><strong>Vertex Cover Size:</strong> {Math.floor((props.currentStepIndex - 1) / 3)}</div>
            </div>
            <div className="step-info-grid vertex-cover-legend-grid vertex-cover-legend-grid--spaced">
                <LegendEntry
                    label="Node-Degree Map N"
                    value={""}
                    icon={<NodeDegreeMapIcon/>}
                />
                <LegendEntry
                    label="Vertex Cover C"
                    value={""}
                    icon={<NodeIcon/>}
                />
                <LegendEntry
                    label="Remaining Edges E'"
                    value={""}
                    icon={<RemainingEdgeIcon/>}
                />
            </div>
            <div className="vertex-cover-degree-table">
                {props.output.initialDegreeMap.map(ndp => {
                    return (<div id={"t1" + ndp.node.id} key={"t1" + ndp.node.id} className="vertex-cover-degree-column">
                        <div className="vertex-cover-degree-cell">{ndp.node.label}</div>
                        <div  id={"t2" + ndp.node.id} key={"t1" + ndp.node.id} className="vertex-cover-degree-cell"></div>
                    </div>);
                })}
            </div>
                </div>
                <div className="step-layout-actions">
                    <ImportExportDialog
                        onImport={props.onImport}
                        createExportString={props.createExportString}
                    />
                </div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_MAX_DEGREE}
                activeLineIds={getActiveLineIdsMaxDegree(props.currentStepIndex, labels.length - 1)}
            />
        </div>
    </div>;
}
