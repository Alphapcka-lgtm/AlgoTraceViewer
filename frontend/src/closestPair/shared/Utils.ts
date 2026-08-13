import type {AlgorithmStepDTO, Point, PointPair} from "./Types.tsx";
import {getAlphabetLabel, getRandomId} from "../../shared/Utils.tsx";

export const hasCurrentDisplayed = (step: AlgorithmStepDTO): boolean =>
    step.currentPoint !== null && step.stepType !== "START" && step.stepType !== "INITIALIZATION" && step.stepType !== "FINISHED";

export const isSamePair = (a: PointPair | null, b: PointPair | null): boolean => {
    // Wenn eines der paare null ist, sind sie nur gleich, wenn BEIDE null sind
    if (!a || !b) return a === b;
    const normalMatch = a.p0.id === b.p0.id && a.p1.id === b.p1.id;
    const flippedMatch = a.p0.id === b.p1.id && a.p1.id === b.p0.id;
    return normalMatch || flippedMatch;
};

const createRandomPoint = (padding: number, svgWidth:number, svgHeight:number): Point => {
    const minX = padding;
    const maxX = svgWidth - padding;
    const minY = padding;
    const maxY = svgHeight - padding;
    return {
        id: getRandomId(),
        x: minX + Math.random() * (maxX - minX),
        y: minY + Math.random() * (maxY - minY),
        label: "",
    };
};

export const createRandomPoints = (count: number, padding: number, svgWidth:number, svgHeight:number): Point[] => {
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
        points.push(createRandomPoint(padding, svgWidth, svgHeight));
    }
    return points;
};

/*
alle vorhandenen lables werden überschrieben, sodass wenn nodes gelöscht wurden keine "beschriftungslücken"
gibt. Das wird gemacht before die nodes ans backend geschicket werden...
label werden nur für anzeige und explanations benutzt... deshalb gibt es noch node id
 */
export function assignLabels(points: Point[]): Point[] {
    return points.map((point, index) => ({...point, label: getAlphabetLabel(index)}));
}