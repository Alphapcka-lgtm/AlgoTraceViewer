import type {TypesRowProps} from "./Types.tsx";

export function TypesRow(props: TypesRowProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;

    return (
        <g key="types_row" id="types_row" style={{opacity: 0}}>
            <rect
                key={"types_row_name_rect"}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellWidth}
                fill="lightgray"
                stroke="black"
            />
            <text
                key={"types_row_name_text"}
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
                            id={`types_row_rect_${index}`}
                            key={`types_row_rect_${index}`}
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            // fill cell yellow when suffix is lms
                            fill={(props.typeMap.map[index].isLms) ? "yellow" : "white"}
                            stroke="black"
                        />
                        <text
                            id={`types_row_text_${index}`}
                            key={`types_row_text_${index}`}
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