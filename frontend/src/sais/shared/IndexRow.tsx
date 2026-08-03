import type {IndexRowProps} from "./Types.tsx";

export function IndexRow(props: IndexRowProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    return (
        <g key="index_row" id="index_row" style={{opacity: 0}}>
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
                fontWeight="bold"
            >
                Index
            </text>
            {
                [...props.source].map((_, index) => (
                    <g key={index}>
                        <rect
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
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