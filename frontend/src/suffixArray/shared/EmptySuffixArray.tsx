import type {EmptySuffixArrayProps} from "./Types.tsx";

export function EmptySuffixArray(props: EmptySuffixArrayProps) {
    const elements = [];
    for (let index = 0; index < props.boxCount; index++) {
        elements.push(
            <g id={`empty_sa_${props.counter}_cell_${index}`} key={`empty_sa_${props.counter}_cell_${index}`}>
                <rect
                    id={`empty_sa_${props.counter}_rect_${index}`}
                    key={`empty_sa_${props.counter}_rect_${index}`}
                    x={props.xOffsetStart + props.nameColWidth + index * props.cellWidth}
                    y={props.yPos}
                    width={props.cellWidth}
                    height={props.cellHeight}
                    fill="white"
                    stroke="black"
                />
                <text
                    id={`empty_sa_${props.counter}_text_${index}`}
                    key={`empty_sa_${props.counter}_text_${index}`}
                    x={props.xOffsetStart + props.xOffsetStart + index * props.cellWidth + props.cellWidth / 2}
                    y={props.yPos + props.cellHeight * 0.7}
                    textAnchor="middle"
                ></text>
            </g>
        );
    }
    return (
        <g id={`empty_sa${props.counter}`} key={`empty_sa${props.counter}`} style={{opacity: 0}}>
            {elements}
        </g>
    )
}