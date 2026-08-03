import type {BucketRowProps} from "./Types.tsx";

export function BucketsRow(props: BucketRowProps) {
    let x = props.xOffsetStart + props.nameColWidth
    const y = props.yPos;

    return (
        <g key="buckets_row" id="buckets_row">
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
                Buckets
            </text>
            {
                props.bucketSizes.flatMap((value) => {
                    const width = props.cellWidth * value.size;
                    const ele = (
                        <g>
                            <rect
                                height={props.cellHeight}
                                width={width}
                                y={y}
                                x={x}
                                fill="white"
                                stroke="black"
                            />
                            <text
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