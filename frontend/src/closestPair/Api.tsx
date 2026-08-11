import type {AlgorithmStepDTO, Point} from "./shared/Types.tsx";
import {useState} from "react";

export default function useClosestPairSteps() {
    const [algoSteps, setAlgoSteps] = useState<AlgorithmStepDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const calculateSteps = async (points: Point[]) => {
        setLoading(true);
        setError(null);

        try {
            const result = await sendPointsAndGetSteps(points);
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

async function sendPointsAndGetSteps(points: Point[]): Promise<AlgorithmStepDTO[]> {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(points),
    }

    const response = await fetch("http://localhost:8080/api/closestPair/steps", requestOptions);

    if (!response.ok) {
        //throw new Error("Request failed");
        throw new Error(`HTTP ${response.status}`);
    }

    return await response.json() as Promise<AlgorithmStepDTO[]>;
}
