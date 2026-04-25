import type {Edge, PreviewEdgeProps, EdgesProps, NormalizedEdgesProps} from "./Types.tsx";
import {getNodeById} from "./Utils.tsx";

export function Edges(props: EdgesProps) {
    return props.edges.map((e: Edge) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        const p = "M " + (from.x) + " " + (from.y) + " L " + (to.x) + " " + (to.y);

        return (
            <path
                id={props.idPrefix + e.id.toString()}
                key={e.id}
                d={p}
                stroke="black"
                strokeWidth={2}
            />
        );
    });
}

export function NormalizedEdges(props: NormalizedEdgesProps) {
    return props.edges.map((e: Edge, i: number) => {
        const from = getNodeById(props.nodes, e.fromId);
        const to = getNodeById(props.nodes, e.toId);

        let itemSize: number;

        if(props.itemSize * props.itemSize * props.edges.length > props.width * props.height){
            itemSize = Math.sqrt( (props.width * props.height) / props.edges.length);
        } else {
            itemSize = props.itemSize;
        }

        const itemsPerRow = Math.floor(props.width / itemSize);
        const gridSize = props.width / itemsPerRow;

        const x0 = props.x + (i % itemsPerRow) * gridSize;
        const y0 = props.y + Math.floor(i / itemsPerRow) * gridSize;

        const length = Math.sqrt( (to.x - from.x) * (to.x - from.x) + (to.y - from.y) * (to.y - from.y) );
        const angle = Math.acos( Math.abs(to.x - from.x) / length );

        let fromX = 0;
        let fromY = 0;
        let toX = (to.x - from.x) * (itemSize / length);
        let toY = (to.y - from.y) * (itemSize / length);

        if (toX >= 0) {
            fromX = x0 + fromX + 0.5 * (gridSize - Math.cos(angle) * gridSize);
            toX = x0 + toX + 0.5 * (gridSize - Math.cos(angle) * gridSize);
        } else {
            fromX = x0 + fromX + 0.5 * (gridSize + Math.cos(angle) * gridSize);
            toX = x0 + toX + 0.5 * (gridSize + Math.cos(angle) * gridSize);
        }

        if(toY >= 0) {
            fromY = y0 + fromY + 0.5 * (gridSize - Math.sin(angle) * gridSize);
            toY = y0 + toY + 0.5 * (gridSize - Math.sin(angle) * gridSize);
        } else {
            fromY = y0 + fromY + 0.5 * (gridSize + Math.sin(angle) * gridSize);
            toY = y0 + toY + 0.5 * (gridSize + Math.sin(angle) * gridSize);
        }

        const p = "M " + (fromX) + " " + (fromY) + " L " + (toX) + " " + (toY);

        return (
            <path
                id={props.idPrefix + e.id.toString()}
                key={e.id}
                d={p}
                stroke="black"
                strokeWidth={1}
                style={{display:"none"}}
            />
        );
    });
}

export function PreviewEdge(props: PreviewEdgeProps) {
    if (props.interaction.type !== "drawing-edge" || !props.interaction.to) return null;

    const from = getNodeById(props.nodes, props.interaction.fromId);

    return (
        <line
            key={-1}
            x1={from.x}
            y1={from.y}
            x2={props.interaction.to.x}
            y2={props.interaction.to.y}
            stroke="black"
            strokeWidth={1}
            strokeDasharray="4"
        />
    );
}