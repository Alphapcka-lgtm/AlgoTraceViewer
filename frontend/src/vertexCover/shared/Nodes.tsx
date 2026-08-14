import {getAlphabetLabel} from "../../shared/Utils.tsx";
import type {NodesProps, Node} from "./Types.tsx";
import {COLORS} from "./Utils.tsx";

export function Nodes(props: NodesProps) {
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id}
            key={n.id}
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
            <circle id={"black_border" + n.id} key={"black_border" + n.id} cx={n.x} cy={n.y} r={0} fill={COLORS.black}/>
            <circle id={"orange_border" + n.id} key={"orange_border" + n.id} cx={n.x} cy={n.y} r={0} fill={COLORS.orange}/>
            <circle id={"black_inner_border" + n.id} key={"black_inner_border" + n.id} cx={n.x} cy={n.y} r={17} fill={COLORS.black}/>
            <circle id={"white_fill" + n.id} key={"white_fill" + n.id} cx={n.x} cy={n.y} r={15} fill={COLORS.white}/>
            <circle id={"orange_fill" + n.id} key={"orange_fill" + n.id} cx={n.x} cy={n.y} r={0} fill={COLORS.orange}/>
            <text
                x={n.x}
                y={n.y}
                key={"u6" + n.id + i}
                textAnchor="middle"
                dominantBaseline="central"
                fill={COLORS.black}
                fontSize="17"
                pointerEvents="none"
            >
                {n.label === "" ? getAlphabetLabel(i) : n.label}
            </text>
        </g>
    ));
}
