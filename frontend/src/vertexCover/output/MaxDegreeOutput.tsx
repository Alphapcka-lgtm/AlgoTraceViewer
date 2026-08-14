import {createStepLabels, getCurrentTimelineStepIndex, SVG_HEIGHT, SVG_WIDTH} from "../../shared/Utils.tsx";
import {
    animateAdd,
    animateChooseMaxDegreeNode,
    animateInit,
    animateInitN,
    animateRemoveAndUpdate,
    animateReturn
} from "../shared/Animations.tsx";
import {LegendEntry, NodeDegreeMapIcon, NodeIcon, RemainingEdgeIcon} from "../../LegendeEntry.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import type {SVGOutputProps, TimelineStep} from "../shared/Types.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import {useMemo, useRef, useState} from "react";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import {Edges} from "../shared/Edges.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";
import {PSEUDOCODE_MAX_DEGREE} from "./PseudoCode.ts";

const STEP_DURATION = 1.0;

export function MaxDegreeOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());

    const {timelineSteps, myLabels} = useMemo(
        () => {
            return {
                timelineSteps: createMaxDegreeVertexCoverOutputSteps(props.output.intermediateStates.length),
                myLabels: createStepLabels(3 * props.output.intermediateStates.length + 3)
            }
        },
        [props.output.intermediateStates.length]
    );

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
                props.cProps.setProgress(tl.progress());

                const stepIndex: number = getCurrentTimelineStepIndex(tl, myLabels);

                props.cProps.setCurrentStepIndex(stepIndex);
            },
            onComplete: () => {
                props.cProps.setProgress(1);
                setIsPlaying(false);
                void timelineRef.current.pause();
            },
        });

        timelineSteps.forEach((targetStep) => {
            switch (targetStep.stepType) {
                case "INIT_CE": {
                    animateInit(timeline, targetStep, props.output);
                    break;
                }
                case "INIT_N": {
                    animateInitN(timeline, targetStep, props.output);
                    break;
                }
                case "CHOOSE": {
                    animateChooseMaxDegreeNode(timeline, targetStep, props.output);
                    break;
                }
                case "ADD": {
                    animateAdd(timeline, targetStep, props.output);
                    break;
                }
                case "REMOVE": {
                    animateRemoveAndUpdate(timeline, targetStep, props.output);
                    break;
                }
                case "RETURN": {
                    animateReturn(timeline, targetStep);
                    break;
                }
            }
        })

        timelineRef.current = timeline;
        void timeline.progress(props.cProps.progress);
        setIsPlaying(false);

        return () => {
            void timeline.kill();
            timelineRef.current = gsap.timeline({paused: true});
        };
    }, {dependencies: [props.output.timestamp]});

    return <div className="algorithm-panel">
        <IOModeTabs
            mode="output"
            onChangeInput={props.cProps.onChangeInput}
            onSubmit={() => {
            }}
            canSubmit={false}
        />
        <svg className="algorithm-canvas" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
             preserveAspectRatio="xMidYMid meet">
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes}/>
            <Nodes nodes={props.output.initialState.nodes}/>
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
        />
        <div className="step-layout">
            <div className="step-layout-side">
                <div className="step-info">
                    <div className="step-info-grid vertex-cover-step-summary">
                        <div><strong>Step:</strong> {props.cProps.currentStepIndex} / {myLabels.length - 1}</div>
                        <div><strong>Vertex Cover
                            Size:</strong> {Math.max(0, Math.floor((props.cProps.currentStepIndex - 1) / 3))}</div>
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
                            return (
                                <div id={"t1" + ndp.node.id} key={"t1" + ndp.node.id}
                                     className="vertex-cover-degree-column">
                                    <div className="vertex-cover-degree-cell">{ndp.node.label}</div>
                                    <div id={"t2" + ndp.node.id} key={"t1" + ndp.node.id}
                                         className="vertex-cover-degree-cell"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="step-layout-actions">
                    <ImportExportDialog
                        onImport={props.cProps.onImport}
                        createExportString={props.cProps.createExportString}
                    />
                </div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_MAX_DEGREE}
                activeLineIds={[timelineSteps[props.cProps.currentStepIndex].stepType]}
            />
        </div>
    </div>;
}

function createMaxDegreeVertexCoverOutputSteps(n: number): TimelineStep[] {
    if (n > 0) {
        const steps: TimelineStep[] = [
            {label: "0", backendStepIndex: -1, stepType: "INIT_CE"},
            {label: "1", backendStepIndex: -1, stepType: "INIT_N"},
        ];
        Array.from({length: n}, (_, i) => i).forEach((i) => {
            steps.push({label: String(3 * i + 2), backendStepIndex: i, stepType: "CHOOSE"})
            steps.push({label: String(3 * i + 3), backendStepIndex: i, stepType: "ADD"})
            steps.push({label: String(3 * i + 4), backendStepIndex: i, stepType: "REMOVE"})
        })
        steps.push({label: String(3 * n + 2), backendStepIndex: -1, stepType: "RETURN"})
        return steps;
    } else {
        return [];
    }
}