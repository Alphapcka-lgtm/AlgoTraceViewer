import type {TypesRowProps} from "./Types.tsx";

export function TypesRow(props: TypesRowProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;

    return (
        <g key="types_row" id="types_row" style={{opacity: 0}}>
            <rect
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellWidth}
                fill="white"
                stroke="black"
            />
            <text
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                Type
            </text>
            {
                [...props.source].map((_, index) => {
                    return (<g key={index}>
                        <rect
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            // fill cell yellow when suffix is lms
                            fill={(props.typeMap.map[index].isLms) ? "yellow" : "white"}
                            stroke="black"
                        />
                        <text
                            x={xCellStart + index * props.cellWidth + props.cellWidth / 2}
                            y={props.yPos + props.cellHeight * 0.7}
                            textAnchor="middle"
                        >
                            {props.typeMap.map[index].type}
                        </text>
                    </g>)
                })
            }
        </g>
    )
}