import {Edges} from "./Edges.tsx";
import {Nodes, type Graph} from "./Nodes.tsx";

type Props = {changeInput: () => void, mode: string, output: Graph};

export function SVGOutput(props: Props) {

    const getNodeById = (id: number) => props.output.nodes.find((n) => n.id === id)!;

    return props.mode == "output" ? <>
        <svg height={500} style={{ border: "1px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.edges} getNode={getNodeById} />
            <Nodes nodes={props.output.nodes} />
        </svg>
        <button onClick={props.changeInput}>Change Input</button>
    </> : <></>
}