import type {ReducedStringProps} from "./Types.tsx";

export function ReducedString(props: ReducedStringProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    const yPositions = props.yPos + props.cellHeight;
    return (
        <g id={"reduced_string"} style={{opacity: 0}}>
            // upper row the reduced word
            <rect
                id={"reduced_string_name_rect"}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellHeight}
                fill="lightgray"
                stroke="black"
            />
            <text
                id={"reduced_string_name_text"}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                Reduced
            </text>
            {
                props.lmsPositions.map((_, index) => (
                    <g id={`reduced_string_elem_${index}`} key={index}>
                        <rect
                            id={`reduced_string_elem_rect_${index}`}
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
                            id={`reduced_string_elem_text_${index}`}
                            x={xCellStart + index * props.cellWidth + props.cellWidth / 2}
                            y={props.yPos + props.cellHeight * 0.7}
                            textAnchor="middle"
                        >
                            {props.reduced[index]}
                        </text>
                    </g>
                ))
            }
            // sub row the positions in the actual word
            {/*<rect*/}
            {/*    id={`reduced_positions_name_rect`}*/}
            {/*    x={props.xOffsetStart}*/}
            {/*    y={yPositions}*/}
            {/*    width={props.nameColWidth}*/}
            {/*    height={props.cellHeight}*/}
            {/*    fill="lightgray"*/}
            {/*    stroke="black"*/}
            {/*/>*/}
            {/*<text*/}
            {/*    id={`reduced_positions_name_text`}*/}
            {/*    x={props.xOffsetStart + props.nameColWidth / 2}*/}
            {/*    y={yPositions + props.cellHeight * 0.7}*/}
            {/*    textAnchor="middle"*/}
            {/*>*/}
            {/*    Position*/}
            {/*</text>*/}
            {/*{*/}
            {/*    props.lmsPositions.map((p, index) => (*/}
            {/*        <g id={`reduced_position_elem_${index}`}>*/}
            {/*            <rect*/}
            {/*                id={`reduced_position_elem_rect_${index}`}*/}
            {/*                x={xCellStart + index * props.cellWidth}*/}
            {/*                y={yPositions}*/}
            {/*                width={props.cellWidth}*/}
            {/*                height={props.cellHeight}*/}
            {/*                fill="lightgray"*/}
            {/*                stroke="black"*/}
            {/*            />*/}
            {/*            <text*/}
            {/*                id={`reduced_position_elem_text_${index}`}*/}
            {/*                x={xCellStart + index * props.cellWidth + props.cellWidth / 2}*/}
            {/*                y={yPositions + props.cellHeight * 0.7}*/}
            {/*                textAnchor="middle"*/}
            {/*            >*/}
            {/*                {p}*/}
            {/*            </text>*/}
            {/*        </g>*/}
            {/*    ))*/}
            {/*}*/}
        </g>
    )
}