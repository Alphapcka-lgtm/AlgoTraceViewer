import type { Node, NodesProps } from "./Types.tsx";
import {getNodeLabel} from "./Utils.tsx";

export function Nodes(props: NodesProps) {
    const colors = {red: "#ca0020", orange: "#f4a582", white: "#f7f7f7", lightblue: "#92c5de", blue: "#0571b0"}
    return props.nodes.map((n: Node, i: number) => (
        <g
            id={n.id.toString()}
            key={n.id}
            onMouseDown={(e) => {
                e.stopPropagation();
                if(props.onMouseDown){
                    props.onMouseDown(n.id);
                }
            }}
            onMouseUp={(e) => {
                e.stopPropagation();
                if(props.onMouseUp){
                    props.onMouseUp();
                }
            }}
            onClick={(e) => {
                e.stopPropagation();
                if(props.onClick){
                    props.onClick(n);
                }
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if(props.onDoubleClick){
                    props.onDoubleClick(n.id);
                }
            }}
        >
            <circle id={ "u1" + n.id } key={ "u1" + n.id } cx={1123 * n.x} cy={500 * n.y} r={0} fill="black" />
            <circle id={ "u2" + n.id } key={ "u2" + n.id } cx={1123 * n.x} cy={500 * n.y} r={0} fill={colors.orange} />
            <circle id={ "u4" + n.id } key={ "u4" + n.id } cx={1123 * n.x} cy={500 * n.y} r={17} fill="black" />
            <circle id={ "u5" + n.id } key={ "u5" + n.id } cx={1123 * n.x} cy={500 * n.y} r={15} fill="white" />
            <circle id={ "u3" + n.id } key={ "u3" + n.id } cx={1123 * n.x} cy={500 * n.y} r={0} fill={colors.orange} />
            <text
                x={1123 * n.x}
                y={500 * n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                fontSize="17"
                pointerEvents="none"
            >
                {n.label ? n.label : getNodeLabel(i)}
            </text>
        </g>
    ));
}
