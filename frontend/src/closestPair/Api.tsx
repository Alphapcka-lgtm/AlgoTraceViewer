import type {AlgorithmStepDTO, Point} from "./shared/Types.tsx";

export async function getClosestPairSteps(points: Point[]): Promise<AlgorithmStepDTO[]> {
    const response = await fetch("http://localhost:8080/api/closestPair/steps", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(points),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}