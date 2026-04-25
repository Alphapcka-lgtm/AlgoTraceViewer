import type { Node } from "./Types";


export async function sendInputPointsToBackend(nodes: Node[]) {

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(nodes),
    }

    try {
        const response = await fetch(
            "http://localhost:8080/api/sweepline/SVGInputPoints", requestOptions);

        if (!response.ok) {
            throw new Error("Request failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending points:", error);
        throw error;
    }
}