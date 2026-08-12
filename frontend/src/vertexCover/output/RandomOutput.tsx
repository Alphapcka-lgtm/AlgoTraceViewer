import {
    getActiveLineIdsRandom,
    createStepLabels,
    getStepIndexFromTimeline,
    PSEUDOCODE_RANDOM,
    SVG_HEIGHT, SVG_WIDTH
} from "../../shared/Utils.tsx";
import {NodeIcon, ArbitraryEdgeIcon, RemainingEdgeIcon, LegendEntry} from "../../LegendeEntry.tsx";
import {ImportExportDialog} from "../../shared/ImportExportDialog.tsx";
import {PseudoCodePanel} from "../../shared/PseudoCodePanel.tsx";
import {OutputControls} from "../../shared/OutputControls.tsx";
import {IOModeTabs} from "../../shared/IOModeTabs.tsx";
import type {SVGOutputProps} from "../shared/Types.tsx";
import DrawSVGPlugin from "gsap/DrawSVGPlugin";
import {Edges} from "../shared/Edges.tsx";
import {Nodes} from "../shared/Nodes.tsx";
import {useRef, useState} from "react";
import {useGSAP} from "@gsap/react";
import gsap from "gsap";

const STEP_DURATION = 1.0;

export function RandomOutput(props: SVGOutputProps) {
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const timelineRef = useRef<gsap.core.Timeline>(gsap.timeline());
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const labels = createStepLabels(3 * props.output.intermediateStates.length + 2);

    const changePlaybackSpeed = (speed: number) => {
        setPlaybackSpeed(speed);
        timelineRef.current.timeScale(speed);
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
                props.setProgress(tl.progress()); //für scrubber

                const stepIndex: number = getStepIndexFromTimeline(tl, labels);

                props.setCurrentStepIndex(stepIndex);
            },
            onComplete: () => {
                props.setProgress(1);
                setIsPlaying(false);
                timelineRef.current.pause();
            },
        });

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

        props.output.intermediateStates.forEach((intermediateState, index) => {

            timeline.set("#u1" + intermediateState.chosenEdge.id, {opacity: 100});
            timeline.from("#u1" + intermediateState.chosenEdge.id, {drawSVG: "50% 50%"}, "<");

            timeline.addLabel(labels[3 * index + 2]);

            intermediateState.chosenNodes.forEach((node, index) => {
                if (index === 0) {
                    timeline.to("#u1" + node.id, {r: 20});
                    timeline.to("#u2" + node.id, {r: 18}, "<");
                    timeline.to("#u3" + node.id, {r: 15}, "<");
                } else {
                    timeline.to("#u1" + node.id, {r: 20}, "<");
                    timeline.to("#u2" + node.id, {r: 18}, "<");
                    timeline.to("#u3" + node.id, {r: 15}, "<");
                }
            })

            timeline.addLabel(labels[3 * index + 3]);

            intermediateState.incidentEdges.forEach((incidentEdge, index) => {
                if (index == 0) {
                    if (incidentEdge.id === intermediateState.chosenEdge.id) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"});
                        timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                    } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"});
                    } else {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"});
                    }
                } else {
                    if (incidentEdge.id === intermediateState.chosenEdge.id) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                        timeline.to("#u1" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                    } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
                    } else {
                        timeline.to("#u0" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
                    }
                }
            });

            timeline.addLabel(labels[3 * index + 4]);
        });

        timelineRef.current = timeline;
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
                        <div><strong>Vertex Cover Size:</strong> {Math.floor(props.currentStepIndex / 3) * 2}</div>
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
                        onImport={props.onImport}
                        createExportString={props.createExportString}
                    />
                </div>
            </div>
            <PseudoCodePanel
                lines={PSEUDOCODE_RANDOM}
                activeLineIds={getActiveLineIdsRandom(props.currentStepIndex, labels.length - 1)}
            />
        </div>
    </div>;
}
