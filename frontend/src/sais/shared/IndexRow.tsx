import type {IndexRowProps} from "./Types.tsx";

export function IndexRow(props: IndexRowProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    return (
        <g key="index_row" id="index_row" style={{opacity: 100}}>
            <rect
                key={"index_row_name_rect"}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellWidth}
                fill="lightgray"
                stroke="black"
            />
            <text
                key={"index_row_name_text"}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
                fontWeight="bold"
            >
                Index
            </text>
            {
                [...props.source].map((_, index) => (
                    <g key={index}>
                        <rect
                            id={`index_row_rect_${index}`}
                            key={`index_row_rect_${index}`}
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
                            key={`index_row_text_${index}`}
                            x={xCellStart + index * props.cellWidth + props.cellWidth / 2}
                            y={props.yPos + props.cellHeight * 0.7}
                            textAnchor="middle"
                            fontWeight="bold"
                        >
                            {index}
                        </text>
                    </g>
                ))
            }
        </g>
    )
}