import {createStepLabels, getStepIndexFromTimeline} from "../../shared/Utils.tsx";
import {getActiveLineIdsMaxDegree, PSEUDOCODE_MAX_DEGREE} from "./PseudoCode.tsx";
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

export function MaxDegreeSVGOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const tlRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3 * props.output.intermediateStates.length + 3);

    const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        tlRef.current.timeScale(speed);
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

                timeline.to("#t1" + node.id + ",#t2" + node.id, {background: colors.red});

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

                timeline.to("#t2" + node.id + ",#t1" + node.id, {background: "none"});
            })

            intermediateState.degreeMap.forEach((ndp) => {
                let previous = props.output.initialDegreeMap.find((prev) => prev.node.id === ndp.node.id)!;

                if (index > 0) {
                    previous = props.output.intermediateStates[index - 1].degreeMap.find((prev) => prev.node.id === ndp.node.id)!;
                }

                if (previous.degree !== ndp.degree) {
                    timeline.to("#t2" + ndp.node.id, {
                        scrambleText: {text: String(ndp.degree), chars: "-|"},
                    }, "<");
                }
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
            <div className="step-info-grid">
                <div><strong>Step:</strong> {props.stepIndex} / {labels.length - 1}</div>
                <div>
                    <table style={{borderSpacing: "10px 10px"}}>
                        <thead>
                        <tr>
                            {props.output.intermediateStates[0].degreeMap.map((ndp, index) => (
                                <th key={index}>
                                    <span id={"t1" + ndp.node.id} style={{
                                        borderRadius: "9px",
                                        background: "none",
                                        textAlign: "center"
                                    }}>{ndp.node.label}</span>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            {props.output.intermediateStates[0].degreeMap.map((ndp, index) => (
                                <th key={index}>
                                    <span id={"t2" + ndp.node.id}
                                          style={{borderRadius: "9px", background: "none", textAlign: "center"}}></span>
                                </th>
                            ))}
                        </tr>
                        </tbody>
                    </table>
                </div>
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