import {Edges} from "./Edges.tsx";
import {StaticNodes} from "./Nodes.tsx";

import type {SVGOutputProps} from "./Types.tsx";

export function SVGOutput(props: SVGOutputProps) {

    return props.mode == "output" ? <>
        <svg height={500} style={{ border: "1px solid black", borderRadius: "30px" }}>
            <Edges edges={props.output.initialState.edges} nodes={props.output.initialState.nodes} />
            <StaticNodes nodes={props.output.initialState.nodes} />
        </svg>
        <button onClick={props.onChangeInput}>Change Input</button>
    </> : <></>
}