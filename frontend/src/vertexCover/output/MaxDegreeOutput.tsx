import {createStepLabels, getStepIndexFromTimeline} from "../../shared/Utils.tsx";
import {
    colors,
    getActiveLineIdsMaxDegree,
    NodeDegreeMapIcon,
    NodeIcon,
    PSEUDOCODE_MAX_DEGREE,
    RemainingEdgeIcon
} from "./PseudoCode.tsx";
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
import {LegendEntry} from "../../LegendeEntry.tsx";

const STEP_DURATION = 1.0;

export function MaxDegreeOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3 * props.output.intermediateStates.length + 3);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
    };

    console.log(props.output)

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
                const tl = tlRef.current;
                props.setProgress(tl.progress());

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setStepIndex(stepIndex);
            },
            onComplete: () => {
                setIsPlaying(false);
                tlRef.current.pause();
            },
        });

        tlRef.current = timeline;

        timeline.addLabel(labels[0]);

        props.output.initialState.edges.forEach((edge, index) => {
            if (index == 0) {
                timeline.set("#u0" + edge.id, {opacity: 100});
            } else {
                timeline.set("#u0" + edge.id, {opacity: 100}, ">");
            }
            timeline.from("#u0" + edge.id, {drawSVG: "50% 50%"}, ">");
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

                intermediateState.degreeMap.forEach((ndp, index) => {

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

                timeline.to(tableElement, {background: "none"});
            })

            timeline.addLabel(labels[3 * index + 5]);
        });

        timeline.progress(props.progress);
        setIsPlaying(false);

        return () => {
            timeline.kill();
            tlRef.current = gsap.timeline({paused: true});
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
        <svg className="algorithm-canvas" viewBox="0 0 1123 500" preserveAspectRatio="xMidYMid meet">
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes}/>
            <Nodes nodes={props.output.initialState.nodes}/>
        </svg>
        <OutputControls
            timelineRef={tlRef}
            labels={labels}
            currentStep={props.stepIndex}
            setCurrentStep={props.setStepIndex}
            stepCount={props.output.intermediateStates.length + 2}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            progress={props.progress}
            setProgress={props.setProgress}
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={changePlaybackSpeed}
        />
        <div className="step-info">
            <div className="step-info-grid" style={{gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 15}}>
                <div><strong>Step:</strong> {props.stepIndex} / {labels.length - 1}</div>
                <div><strong>Vertex Cover Size:</strong> {Math.floor((props.stepIndex - 1) / 3)}</div>
            </div>
            <div className="step-info-grid" style={{gridTemplateColumns: "repeat(3, 1fr)", marginBottom: 15}}>
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
            <div style={{
                display: "flex",
                flexWrap: "nowrap",
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: "12px"
            }}>
                {props.output.initialDegreeMap.map(ndp => {
                    return (<div id={"t1" + ndp.node.id} key={"t1" + ndp.node.id} style={{flex: 1, fontSize: 20}}>
                        <div style={{
                            minWidth: "27px",
                            border: "solid 1px",
                            textAlign: "center",
                            textShadow: "1px 1px 0px rgba(255, 255, 255, 1)"
                        }}>{ndp.node.label}</div>
                        <div id={"t2" + ndp.node.id} key={"t1" + ndp.node.id} style={{
                            minWidth: "27px",
                            border: "solid 1px",
                            textAlign: "center",
                            textShadow: "1px 1px 0px rgba(255, 255, 255, 1)"
                        }}></div>
                    </div>);
                })}
            </div>
        </div>
        <PseudoCodePanel
            lines={PSEUDOCODE_MAX_DEGREE}
            activeLineIds={getActiveLineIdsMaxDegree(props.stepIndex, labels.length - 1)}
            title={"Vertex Cover PseudoCode"}
        />
        <ImportExportDialog
            createExportString={props.createExportString}
            onImport={props.onImport}
        />
    </div>;
}