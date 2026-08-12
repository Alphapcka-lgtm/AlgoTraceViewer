export type EhrlichSwapStepDTO = {
    description: string;
    valuesBefore: string[];
    valuesAfter: string[];
    bBefore: number[];
    bAfter: number[];
    k: number;
    swapIndex: number; //b[k]
    swappedLeftValue: string;
    swappedRightValue: string;
};

export async function getEhrlichSwapSteps(values: string[]): Promise<EhrlichSwapStepDTO[]> {
    const response = await fetch("http://localhost:8080/api/swaps/swap_steps", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(values)
        }
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}