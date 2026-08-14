import {LegendEntry, XPointIcon} from "../../LegendeEntry.tsx";
import type {AlgorithmStepDTO} from "../shared/Types.tsx";
import {hasCurrentDisplayed} from "../shared/Utils.ts";

type LegendProps = {
    step: AlgorithmStepDTO;
    currentStepIndex: number;
    totalSteps: number;
};

export function Legend({step, currentStepIndex, totalSteps}: LegendProps) {
    const activePointsLegendValue:string = step.currentPoint === null ? "—" : step.activePoints.length === 0 ? "Empty"
        : step.activePoints.map((p) => p.label).join(", ");

    const candidateDistances = step.stepType !== "CHECK_CANDIDATES" ? "—" : step.candidateComparisons.length === 0
        ? "No comparisons" : step.candidateComparisons.map(({candidate, distance}) =>
            `d(${step.currentPoint!.label}, ${candidate.label}) = ${distance.toFixed(2)}`).join(", ");

    const candidateLabels = step.stepType !== "CHECK_CANDIDATES" ? "—" : step.candidateComparisons.length === 0
        ? "None" : step.candidateComparisons.map(({candidate}) => candidate.label) .join(", ");

    return (
        <div className="step-info closest-pair-step-info">
            <div className="step-info-grid">
                <strong>Step: {step.stepType === "START" ? "Start" : `${currentStepIndex} / ${totalSteps - 1}`}</strong>
                <div>
                    <strong>Minimum distance δ:</strong>{" "}
                    {step.bestPair?.distance.toFixed(2) ?? "—"}
                </div>

                <LegendEntry
                    label="Current Point: "
                    value={hasCurrentDisplayed(step) ? step.currentPoint!.label : "—"}
                    icon={<XPointIcon color="#222222" variant="current"/>}
                />
                <div>
                    <LegendEntry
                        label="Closest pair: "
                        value={step.bestPair ? `${step.bestPair.p0.label} ↔ ${step.bestPair.p1.label}` : "—"}
                        icon={<XPointIcon color="#0000CD" ringStyle="none"/>}
                    />
                </div>
                <div>
                    <LegendEntry
                        label="Active Set: "
                        value={activePointsLegendValue}
                        icon={<XPointIcon color="#222222" ringStyle="active"/>}
                    />
                </div>

                <div>
                    <LegendEntry
                        label="Candidates: "
                        value={candidateLabels}
                        icon={<XPointIcon color="#222222" ringStyle="candidate"/>}
                    />
                </div>
            </div>
            <div className="closest-pair-candidate-distances">
                <strong>Distances to current:</strong>{" "}
                {candidateDistances}
            </div>

            <div className="closest-pair-step-description"> {step.description} </div>
        </div>
    );
}