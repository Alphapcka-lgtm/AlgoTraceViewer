import React, { useState } from "react";

type Point = { x: number; y: number; id: number };
type Edge = { from: Point; to: Point };

export function SVGClick() {
    const [points, setPoints] = useState<Point[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [drawEdgeFrom, setDrawEdgeFrom] = useState<Point | null>(null);
    const [drawEdgeTo, setDrawEdgeTo] = useState<Point | null>(null);
    const [draggingPointId, setDraggingPointId] = useState<number | null>(null);
    const [wasDragging, setWasDragging] = useState<boolean>(false);

    const getMousePos = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (wasDragging) {
            setWasDragging(false);
            setDrawEdgeFrom(null);
            return;
        }
        if (drawEdgeFrom !== null) {
            setDrawEdgeFrom(null);
            setDrawEdgeTo(null);
            return;
        }
        const { x, y } = getMousePos(e);

        setPoints((prev) => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;
            return [...prev, { x, y, id: lastId + 1 }];
        });
    }

    const handleCircleClick = (e: React.MouseEvent<SVGGElement>, p: Point) => {
        e.stopPropagation();
        if (drawEdgeFrom !== null) {
            if(edges.every((edge) =>
                !(edge.from.id === drawEdgeFrom.id && edge.to.id === p.id) &&
                !(edge.to.id === drawEdgeFrom.id && edge.from.id === p.id))) {
                setEdges((prev) => [...prev, {from: drawEdgeFrom, to: p}]);
            }
            setDrawEdgeFrom(null);
            setDrawEdgeTo(null);
            return;
        }
        if(wasDragging) {
            setWasDragging(false);
            return;
        }
        setDrawEdgeFrom(p)
    }

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (drawEdgeFrom !== null) {
            const { x, y } = getMousePos(e);
            setDrawEdgeTo({ x, y, id: -1 });
        }
        if (draggingPointId !== null) {
            const { x, y } = getMousePos(e);
            setPoints((prev) =>
                prev.map((point) => {
                    if (point.id === draggingPointId) {
                        point.x = x;
                        point.y = y;
                    }
                    return point;
                })
            );
            setWasDragging(true);
        }
    };

    return (
        <>
            <svg
            height={800}
            style={{ border: "1px solid black" }}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
        >
            {edges.map((e, i) => (
                <g
                    key={i}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <line
                        key={i}
                        x1={e.from.x}
                        y1={e.from.y}
                        x2={e.to.x}
                        y2={e.to.y}
                        stroke="black"
                        strokeWidth={2}
                    />
                </g>
            ))}
            {drawEdgeFrom !== null && drawEdgeTo !== null ? <line
                key={-1}
                x1={drawEdgeFrom.x}
                y1={drawEdgeFrom.y}
                x2={drawEdgeTo.x}
                y2={drawEdgeTo.y}
                stroke="black"
                strokeWidth={2}
            /> : <></>}
            {points.map((p) => (
                <g
                    key={p.id}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggingPointId(p.id);
                    }}
                    onMouseUp={(e) => {
                        e.stopPropagation();
                        setDraggingPointId(null);
                    }}
                    onDoubleClick={(e) => {
                        e.stopPropagation();
                        setPoints(points.filter((point) => point.id !== p.id));
                        setEdges(edges.filter((edge) => edge.from.id !== p.id && edge.to.id !== p.id));
                        setDrawEdgeFrom(null)
                    }}
                    onClick={(e) => {
                        handleCircleClick(e, p);
                    }}
                >
                    <circle cx={p.x} cy={p.y} r={10} fill="black" />
                    <text
                        x={p.x}
                        y={p.y}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="white"
                        fontSize="10"
                        pointerEvents="none"
                    >
                        {p.id}
                    </text>
                </g>
            ))}
        </svg>
        <button type={"button"} onClick={() => {
            setPoints([])
            setEdges([])
        }}>reset</button>
            <button type={"button"} onClick={() => {
                const url = "http://localhost:8080/test";
                fetch(url, {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({ points: points, edges: edges }),
                }).then(response => response.json())
                    .then((json) => console.log(json));
            }}>submit</button>
        </>
    );
}