import {ArbitraryEdgeIcon, LegendEntry, NodeIcon, RemainingEdgeIcon} from "../../LegendeEntry.tsx";
import type {LegendProps, NodeDegreePair} from "../shared/Types.tsx";

export function MaxDegreeLegend(props: LegendProps) {
    return (
        <div className="step-info">
            <div className="step-info-grid vertex-cover-step-summary">
                <div><strong>Step:</strong> {props.currentStepIndex} / {props.maxStepIndex}</div>
                <div><strong>Vertex Cover Size:</strong> {Math.max(0, Math.floor((props.currentStepIndex - 1) / 3))}</div>
                {props.variant === "maxDegree" ? <></> : <div><strong>k:</strong> {Math.max(0, Math.floor((props.currentStepIndex - 2) / 3))}</div>}
            </div>
            <div className="step-info-grid vertex-cover-legend-grid vertex-cover-legend-grid--spaced">
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
                <div><strong>{props.variant === "maxDegree" ? "Node-Degree Map N" : "Descending Degree List L"}</strong></div>
                <div className="vertex-cover-degree-table__columns">
                    {props.initialDegreeMap!.map((ndp: NodeDegreePair) => (
                        <div id={"column" + ndp.node.id} key={"column" + ndp.node.id}
                             className="vertex-cover-degree-column">
                            <div id={"label" + ndp.node.id} key={"label" + ndp.node.id}
                                 className="vertex-cover-degree-cell">{ndp.node.label}</div>
                            <div id={"degree" + ndp.node.id} key={"degree" + ndp.node.id}
                                 className="vertex-cover-degree-cell"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export function RandomLegend(props: LegendProps) {
    return (
        <div className="step-info">
            <div className="step-info-grid vertex-cover-step-summary">
                <div><strong>Step:</strong> {props.currentStepIndex} / {props.maxStepIndex}</div>
                <div><strong>Vertex Cover Size:</strong> {Math.floor(props.currentStepIndex / 3) * 2}
                </div>
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
    )
}