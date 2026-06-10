import {getAlphabetLabel} from "../../sweepLine/shared/Utils.tsx";
import type {Node} from "../../sweepLine/shared/Types.tsx"
import type {NodesProps} from "./Types.tsx";

export function Nodes(props: NodesProps) {
    const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id.toString()}
            key={n.id + i}
            onMouseDown={(e) => {
                e.stopPropagation();
                if (props.onMouseDown) {
                    props.onMouseDown(n.id);
                }
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                if (props.onMouseUp) {
                    props.onMouseUp();
                }
            }}
            onClick={(e) => {
                e.stopPropagation();
                if (props.onClick) {
                    props.onClick(n);
                }
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (props.onDoubleClick) {
                    props.onDoubleClick(n.id);
                }
            }}
        >
            <circle id={"u1" + n.id} key={"u1" + n.id + i} cx={n.x} cy={n.y} r={0} fill="black"/>
            <circle id={"u2" + n.id} key={"u2" + n.id + i} cx={n.x} cy={n.y} r={0} fill={colors.orange}/>
            <circle id={"u4" + n.id} key={"u4" + n.id + i} cx={n.x} cy={n.y} r={17} fill="black"/>
            <circle id={"u5" + n.id} key={"u5" + n.id + i} cx={n.x} cy={n.y} r={15} fill="white"/>
            <circle id={"u3" + n.id} key={"u3" + n.id + i} cx={n.x} cy={n.y} r={0} fill={colors.orange}/>
            <text
                x={n.x}
                y={n.y}
                key={"u6" + n.id + i}
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="17"
                pointerEvents="none"
            >
                {n.label === "" ? getAlphabetLabel(i) : n.label}
            </text>
        </g>
    ));
}
