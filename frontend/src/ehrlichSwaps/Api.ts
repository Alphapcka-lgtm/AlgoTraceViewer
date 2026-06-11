

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

export async function sendSwapInput(values: string[]): Promise<EhrlichSwapStepDTO[]> {
    const requestOptions: RequestInit = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(values),
    };

    const response = await fetch("http://localhost:8080/api/swaps/swap_steps", requestOptions);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    const responseBody = await response.json() as EhrlichSwapStepDTO[];
    return responseBody;
}