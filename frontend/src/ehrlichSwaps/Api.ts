import type {EhrlichSwapStepDTO} from "./shared/Types.tsx";

export async function getEhrlichSwapSteps(values: string[]): Promise<EhrlichSwapStepDTO[]> {
    const response = await fetch("/api/ehrlichSwaps/steps", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(values)
        }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}