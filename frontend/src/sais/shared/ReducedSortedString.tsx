import type {ReducedSortedStringProps} from "./Types.tsx";

export function ReducedSortedString(props: ReducedSortedStringProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    console.log("ReducedSortedString");
    console.log("reduced:", props.reducedSorted);
    console.log("pos:", props.lmsPositions);
    return (
        <g id={`reduced_sorted_string`} style={{opacity: 0}}>
            // upper row the reduced word sorted
            <rect
                id={`reduced_sorted_string_name_rect`}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellHeight}
                fill="lightgray"
                stroke="black"
            />
            <text
                id={`reduced_sorted_string_name_text`}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                Sorted
            </text>
            {
                props.reducedSorted.map((ri, index) => (
                    <g id={`reduced_sorted_string_elem${index}`}>
                        <rect
                            id={`reduced_sorted_elem_rect_${index}`}
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
                            id={`reduced_sorted_elem_text_${index}`}
                            x={xCellStart + index * props.cellWidth + props.cellWidth / 2}
                            y={props.yPos + props.cellHeight * 0.7}
                            textAnchor="middle"
                        >
                            {ri}
                        </text>
                    </g>
                ))
            }
        </g>
    )
}