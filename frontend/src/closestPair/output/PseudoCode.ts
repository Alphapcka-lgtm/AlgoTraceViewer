import type {ClosestPairStepType} from "../shared/Types.tsx";
import type {PseudoCodeLine} from "../../shared/Types.tsx";

export function getActivePseudoCodeLineIds(stepType: ClosestPairStepType): string[] {
    switch (stepType) {
        case "START": return [];
        case "INITIALIZATION": return ["sort", "init"];
        case "ADVANCE_AND_PRUNE": return ["set-current", "remove-inactive"];
        case "CHECK_CANDIDATES": return ["candidate-window", "check-distance"];
        case "COMMIT_ITERATION":return ["update-best", "insert-current"];
        case "FINISHED": return ["return"];
    }
}

export const SWEEP_LINE_PSEUDOCODE: PseudoCodeLine[] = [
    {id: "sort", text: "p ← points sorted by x-coordinate" //text: "sort points by x; initialize bestPair and δ"
    },
    {id: "init", text: "initialize closestPair, δ and activeSet with p[0], p[1]"
    },
    {id: "for-loop", text: "for i ← 2 to |p| − 1 do"//"for each remaining point:"
    },
    {id: "set-current", text: "current ← p[i]", //"current = next point",
        indent: 1
    },
    {id: "remove-inactive",
        text: "remove points left of the δ-wide activeWindow from activeSet", indent: 1
    },
    {id: "candidate-window",
        text: "C ← points in activeSet with |current.y − p.y| < δ", indent: 1 //select candidates with |current.y - p.y| < δ
    },
    {
        id: "check-distance",
        text: "compare current with each p ∈ C", indent: 1 //compare current with each candidate
    },
    {id: "update-best",
        text: "if a closer pair is found: update δ and closestPair", indent: 1
    },
    {id: "insert-current",
        text: "insert current into activeSet", indent: 1
    },
    {id: "return",
        text: "return closestPair and δ"
    }
];