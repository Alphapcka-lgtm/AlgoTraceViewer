import {getActiveLineIdsRandom, createStepLabels, getStepIndexFromTimeline, PSEUDOCODE_RANDOM, SVG_HEIGHT, SVG_WIDTH} from "../../shared/Utils.tsx";
import {NodeIcon, ArbitraryEdgeIcon, RemainingEdgeIcon, LegendEntry} from "../../LegendeEntry.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import type {AnimationResponse, AnimationState, SVGOutputProps, TimelineStep} from "../shared/Types.tsx";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import {Edges} from "../shared/Edges.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {useMemo, useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const STEP_DURATION = 1.0;

export function RandomOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    const {timelineSteps, myLabels} = useMemo(
        ()=> {
            return {
                timelineSteps: createRandomVertexCoverOutputSteps(props.output.intermediateStates.length),
                myLabels: createStepLabels(3 * props.output.intermediateStates.length + 2)
            }
        },
        [props.output.intermediateStates.length]
    );

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        void timelineRef.current.timeScale(speed);
    };

    useGSAP(() => {

        gsap.registerPlugin(DrawSVGPlugin);

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                duration: STEP_DURATION,
                ease: "power2.inOut",
            },
            onUpdate: () => {
                const tl = timelineRef.current;
                props.cProps.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getStepIndexFromTimeline(tl, myLabels);

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
                case "INIT": {
                    animateInit(timeline, targetStep, props.output);
                    break;
                }
                case "CHOOSE": {
                    animateChoose(timeline, targetStep, props.output);
                    break;
                }
                case "ADD": {
                    animateAdd(timeline, targetStep, props.output);
                    break;
                }
                case "REMOVE": {
                    animateRemove(timeline, targetStep, props.output);
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
        <svg className="algorithm-canvas" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
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
            playbackSpeed={playbackSpeed}
            onPlaybackSpeedChange={changePlaybackSpeed}
        />
        <div className="step-layout">
            <div className="step-layout-side">
                <div className="step-info">
                    <div className="step-info-grid vertex-cover-step-summary">
                        <div><strong>Step:</strong> {props.cProps.currentStepIndex} / {myLabels.length - 1}</div>
                        <div><strong>Vertex Cover Size:</strong> {Math.floor(props.cProps.currentStepIndex / 3) * 2}</div>
                    </div>
                    <div className="step-info-grid vertex-cover-legend-grid">
                        <LegendEntry
                            label="Arbitrary Edge e"
                            value={""}
                            icon={<ArbitraryEdgeIcon/>}
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
                </div>
                <div className="step-layout-actions">
                    <ImportExportDialog
                        onImport={props.cProps.onImport}
                        createExportString={props.cProps.createExportString}
                    />
                </div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_RANDOM}
                activeLineIds={getActiveLineIdsRandom(props.cProps.currentStepIndex, myLabels.length - 1)}
            />
        </div>
    </div>;
}

function createRandomVertexCoverOutputSteps(n: number): TimelineStep[] {
    if (n > 0) {
        const steps: TimelineStep[] = [
            {label: "0", backendStepIndex: -1, stepType: "INIT"},
        ];
        Array.from({length: n}, (_, i) => i).forEach((i) => {
            steps.push({label: String(3*i+1), backendStepIndex: i, stepType: "CHOOSE"})
            steps.push({label: String(3*i+2), backendStepIndex: i, stepType: "ADD"})
            steps.push({label: String(3*i+3), backendStepIndex: i, stepType: "REMOVE"})
        })
        steps.push({label: String(3*n+1), backendStepIndex: -1, stepType: "RETURN"})
        return steps;
    } else {
        return [];
    }
}

function animateInit(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label)

    output.initialState.edges.forEach((edge, index) => {
        if (index == 0) {
            void timeline.set("#u0" + edge.id, {opacity: 100});
        } else {
            void timeline.set("#u0" + edge.id, {opacity: 100}, "<");
        }
        void timeline.from("#u0" + edge.id, {drawSVG: "50% 50%"}, "<");
    })
}

function animateChoose(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    void timeline.set("#u1" + intermediateState.chosenEdge.id, {opacity: 100});
    void timeline.from("#u1" + intermediateState.chosenEdge.id, {drawSVG: "50% 50%"}, "<");
}

function animateAdd(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    intermediateState.chosenNodes.forEach((node, index) => {
        if (index === 0) {
            void timeline.to("#u1" + node.id, {r: 20});
            void timeline.to("#u2" + node.id, {r: 18}, "<");
            void timeline.to("#u3" + node.id, {r: 15}, "<");
        } else {
            void timeline.to("#u1" + node.id, {r: 20}, "<");
            void timeline.to("#u2" + node.id, {r: 18}, "<");
            void timeline.to("#u3" + node.id, {r: 15}, "<");
        }
    })
}

function animateRemove(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    intermediateState.incidentEdges.forEach((incidentEdge, index) => {
        if (index == 0) {
            if (incidentEdge.id === intermediateState.chosenEdge.id) {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"});
                void timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
            } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"});
            } else {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"});
            }
        } else {
            if (incidentEdge.id === intermediateState.chosenEdge.id) {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                void timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
            } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
            } else {
                void timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
            }
        }
    });
}

function animateReturn(timeline: gsap.core.Timeline, step: TimelineStep){
    void timeline.add(step.label);
}
