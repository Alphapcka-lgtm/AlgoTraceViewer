
import type {RectangleProps, RectangleListProps} from "./Types.tsx";

function Rectangle({rectangle}: RectangleProps) {
    return (
        <rect
            x={rectangle.x}
            y={rectangle.y}
            width={rectangle.width}
            height={rectangle.height}
            fill="steelblue"
            stroke="black"
        />
    );
}


export function RectangleCanvas({rectangles}: RectangleListProps) {
    return (
        <>
            {rectangles.map((rectangle) => (
                <Rectangle key={rectangle.id} rectangle={rectangle}/>
            ))};
        </>
    )
}