import type {AnimationResponse, AnimationState, TimelineStep} from "./Types.tsx";
import {COLORS} from "./Utils.tsx";

export function animateInit(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label)

    output.initialState.edges.forEach((edge, index) => {
        if (index == 0) {
            void timeline.set("#blue" + edge.id, {opacity: 100});
        } else {
            void timeline.set("#blue" + edge.id, {opacity: 100}, "<");
        }
        void timeline.from("#blue" + edge.id, {drawSVG: "50% 50%"}, "<");
    })
}

export function animateInitN(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    output.initialDegreeMap.forEach((ndp, index) => {

        if (index === 0) {
            void timeline.to("#degree" + ndp.node.id, {
                scrambleText: {text: String(ndp.degree), chars: "-|"},
                borderTop: "solid 1px"
            });
        } else {
            void timeline.to("#degree" + ndp.node.id, {
                scrambleText: {text: String(ndp.degree), chars: "-|"},
                borderTop: "solid 1px"
            }, "<");
        }
    })
}

export function animateChooseMaxDegreeNode(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]
    const maxDegreeNode = intermediateState.chosenNodes[0];
    const column = document.getElementById("column" + maxDegreeNode.id)! as HTMLDivElement;

    void timeline.to([column], {
        background: COLORS.red,
        onStart: () => column.scrollIntoView({
            behavior: "smooth",
            inline: "center",
            block: "nearest"
        })
    });
}

export function animateChooseRandomEdge(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    void timeline.set("#red" + intermediateState.chosenEdge.id, {opacity: 100});
    void timeline.from("#red" + intermediateState.chosenEdge.id, {drawSVG: "50% 50%"}, "<");
}

export function animateAdd(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    intermediateState.chosenNodes.forEach((node, index) => {
        if (index === 0) {
            void timeline.to("#black_border" + node.id, {r: 20});
            void timeline.to("#orange_border" + node.id, {r: 18}, "<");
            void timeline.to("#orange_fill" + node.id, {r: 15}, "<");
        } else {
            void timeline.to("#black_border" + node.id, {r: 20}, "<");
            void timeline.to("#orange_border" + node.id, {r: 18}, "<");
            void timeline.to("#orange_fill" + node.id, {r: 15}, "<");
        }
    })
}

export function animateRemoveRandom(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]

    intermediateState.incidentEdges.forEach((incidentEdge, index) => {
        if (index == 0) {
            if (incidentEdge.id === intermediateState.chosenEdge.id) {
                void timeline.to("#red" + incidentEdge.id, {drawSVG: "50% 50%"});
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
            } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "0% 0%"});
            } else {
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "100% 100%"});
            }
        } else {
            if (incidentEdge.id === intermediateState.chosenEdge.id) {
                void timeline.to("#red" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "50% 50%"}, "<");
            } else if (incidentEdge.fromId === intermediateState.chosenEdge.fromId || incidentEdge.fromId === intermediateState.chosenEdge.toId) {
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
            } else {
                void timeline.to("#blue" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
            }
        }
    });
}

export function animateRemoveMaxDegree(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    void timeline.addLabel(step.label);

    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]
    const maxDegreeNode = intermediateState.chosenNodes[0];


    intermediateState.incidentEdges.forEach((incidentEdge, index) => {
        if (index == 0) {
            if (incidentEdge.fromId === maxDegreeNode.id || incidentEdge.fromId === maxDegreeNode.id) {
                timeline.to("#blue" + incidentEdge.id, {drawSVG: "0% 0%"});
            } else {
                timeline.to("#blue" + incidentEdge.id, {drawSVG: "100% 100%"});
            }
        } else {
            if (incidentEdge.fromId === maxDegreeNode.id || incidentEdge.fromId === maxDegreeNode.id) {
                timeline.to("#blue" + incidentEdge.id, {drawSVG: "0% 0%"}, "<");
            } else {
                timeline.to("#blue" + incidentEdge.id, {drawSVG: "100% 100%"}, "<");
            }
        }
    });
}

export function animateRemoveAndUpdate(timeline: gsap.core.Timeline, step: TimelineStep, output: AnimationResponse){
    animateRemoveMaxDegree(timeline, step, output);
    const intermediateState: AnimationState = output.intermediateStates[step.backendStepIndex]
    const maxDegreeNode = intermediateState.chosenNodes[0];
    const previous = step.backendStepIndex == 0 ? output.initialDegreeMap : output.intermediateStates[step.backendStepIndex-1].degreeMap;
    let first = true;

    intermediateState.degreeMap.forEach((ndp, index) => {
        if(previous[index].degree != ndp.degree) {
            if (first) {
                void timeline.to("#degree" + ndp.node.id, {
                    scrambleText: {text: String(ndp.degree), chars: "-|"},
                });
                first = false;
            } else {
                void timeline.to("#degree" + ndp.node.id, {
                    scrambleText: {text: String(ndp.degree), chars: "-|"},
                }, "<");
            }
        }
    })

    void timeline.to("#column" + maxDegreeNode.id, {background: "none"}, "<");
}

export function animateReturn(timeline: gsap.core.Timeline, step: TimelineStep){
    void timeline.add(step.label);
}
