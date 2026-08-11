import type {BucketRowProps} from "./Types.tsx";

export function BucketsRow(props: BucketRowProps) {
    let x = props.xOffsetStart + props.nameColWidth
    const y = props.yPos;

    return (
        <g key="buckets_row" id="buckets_row" style={{opacity: 0}}>
            <rect
                key={"buckets_row_name_rect"}
                x={props.xOffsetStart}
                y={props.yPos}
                width={props.nameColWidth}
                height={props.cellWidth}
                fill="white"
                stroke="black"
            />
            <text
                key={"buckets_row_name_text"}
                x={props.xOffsetStart + props.nameColWidth / 2}
                y={props.yPos + props.cellHeight * 0.7}
                textAnchor="middle"
            >
                Buckets
            </text>
            {
                props.bucketSizes.flatMap((value, index) => {
                    const width = props.cellWidth * value.size;
                    const ele = (
                        <g key={"buckets_row_elems_" + index}>
                            <rect
                                key={"buckets_row_rect_" + index}
                                height={props.cellHeight}
                                width={width}
                                y={y}
                                x={x}
                                fill="white"
                                stroke="black"
                            />
                            <text
                                key={"buckets_row_text_" + index}
                                x={x + width / 2}
                                y={y + props.cellHeight * 0.7}
                                textAnchor="middle"
                            >
                                {value.c}
                            </text>
                        </g>
                    );

                    x = x + width;

                    return ele;
                })
            }
        </g>
    )
}