import type {LmsPositionsProps} from "./Types.tsx";

export function LmsPositions(props: LmsPositionsProps) {
    const xCellStart = props.nameColWidth + props.xOffsetStart;
    return (
        <g id={`lms_positions`} key={`lms_positions`} style={{opacity: 0}}>
            <rect
                id={`lms_positions_name_rect`}
                key={`lms_positions_name_rect`}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellHeight}
                fill="lightgray"
                stroke="black"
            />
            <text
                id={`lms_positions_name_text`}
                key={`lms_positions_name_text`}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                LMS Positions
            </text>
            {
                props.lmsPositions.map((pos, index) => (
                    <g id={`lms_positions_elem_${index}`} key={index}>
                        <rect
                            id={`lms_positions_rect_${index}`}
                            key={`lms_positions_rect_${index}`}
                            x={xCellStart + index * props.cellWidth}
                            y={props.yPos}
                            width={props.cellWidth}
                            height={props.cellHeight}
                            fill="white"
                            stroke="black"
                        />
                        <text
                            id={`lms_positions_text_${index}`}
                            key={`lms_positions_text_${index}`}
                            x={xCellStart + index * props.cellWidth + props.cellWidth / 2}
                            y={props.yPos + props.cellHeight * 0.7}
                            textAnchor="middle"
                        >
                            {pos}
                        </text>
                    </g>
                ))
            }
        </g>
    );
}