import type {TextRowProps} from "./Types.tsx";

export function TextRow(props: TextRowProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    return (
        <g key="text_row" id="text_row" style={{opacity: 0}}>
            <rect
                key={"text_row_name_rect"}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellWidth}
                fill="white"
                stroke="black"
            />
            <text
                key={"text_row_name_text"}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                Word
            </text>
            {
                [...props.source].map((char, index) => (
                    <g key={index}>
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
                            {char}
                        </text>
                    </g>
                ))
            }
        </g>
    )
}