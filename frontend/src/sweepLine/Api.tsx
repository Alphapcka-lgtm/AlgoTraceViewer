import type {AlgorithmStepDTO, Node} from "./shared/Types.tsx";
import {useState} from "react";

export default function useSweepLineSteps() {
    const [algoSteps, setAlgoSteps] = useState<AlgorithmStepDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateSteps = async (nodes: Node[]) => {
        setLoading(true);
        setError(null);

        try {
            const result = await sendPointsAndGetSteps(nodes);
            setAlgoSteps(result);
            return result;
        } catch (error) {
            setError("The algorithm steps could not be calculated.");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return { algoSteps, loading, error, calculateSteps };
}

async function sendPointsAndGetSteps(nodes: Node[]): Promise<AlgorithmStepDTO[]> {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(nodes),
    }

    const response = await fetch("http://localhost:8080/api/sweepline/steps", requestOptions);

    if (!response.ok) {
        //throw new Error("Request failed");
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as Promise<AlgorithmStepDTO[]>;
}
