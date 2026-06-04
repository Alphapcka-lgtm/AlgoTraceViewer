import {SVGOutput} from "./output/SVGOutput.tsx";
import {SVGInput} from "./input/SVGInput.tsx";
import {useState} from "react";

import type {AnimationResponse, AnimationRequest} from "./shared/Types.tsx";
import {encodeExportState} from "../sweepLine/shared/Utils.tsx";

export function VertexCover() {
    const [mode, setMode] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [stepIndex, setStepIndex] = useState(0);

    const [input, setInput] = useState<AnimationRequest>({
        graph: {nodes: [], edges: []},
        densityFactor: 0.2,
        randomSeed: 0,
        timestamp: 1
    });

    const [output, setOutput] = useState<AnimationResponse>({
        initialState: {nodes: [], edges: []},
        intermediateStates: [],
        randomSeed: 0,
        timestamp: 0
    });

    const submitInput = () => {
        if (input.timestamp > output.timestamp) {
            fetchAnimation(input)
                .then(() => {
                    setProgress(0);
                    setMode("output");
                });
        } else {
            setMode("output");
        }
    };

    const fetchAnimation = async (input: AnimationRequest) => {
        return fetch("http://localhost:8080/vertexcover/random", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as AnimationResponse;
                setInput({...input, randomSeed: output.randomSeed});
                setOutput(output);
            });
    };

    return (
        <div className="algorithm-shell">
            {mode == "input" ?
                <SVGInput
                    setInput={setInput}
                    input={input}
                    onSubmit={submitInput}
                /> :
                <SVGOutput
                    setProgress={setProgress}
                    progress={progress}
                    setStepIndex={setStepIndex}
                    stepIndex={stepIndex}
                    output={output}
                    onChangeInput={() => setMode("input")}
                    createExportString={() => encodeExportState({algorithm: "vertexCover", progress, input})}
                />
            }
        </div>
    )
}