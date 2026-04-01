import {Edges, type Edge} from "./Edges.tsx";
import {Nodes, type Graph} from "./Nodes.tsx";

type State = {chosenEdge: Edge, chosenNodes: Node[], incidentEdges: Edge[]}
export type Animation = {initialState: Graph, intermediateStates: State[]}
type Props = {onChangeInput: () => void, mode: string, output: Animation};

export function SVGOutput(props: Props) {

    const getNodeById = (id: number) => props.output.initialState.nodes.find((n) => n.id === id)!;

    return props.mode == "output" ? <>
        <svg height={500} style={{ border: "1px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.initialState.edges} getNode={getNodeById} />
            <Nodes nodes={props.output.initialState.nodes} />
        </svg>
        <button onClick={props.onChangeInput}>Change Input</button>
    </> : <></>
}