import {SVGOutput} from "./output/SVGOutput.tsx";
import {SVGInput} from "./input/SVGInput.tsx";
import {useState} from "react";

import type {AnimationResponse, AnimationRequest} from "./shared/Types.tsx";
import {getRandomId} from "./shared/Utils.tsx";

export function EhrlichSwaps() {
    const [mode, setMode] = useState<"input" | "output">("output");
    const [progress, setProgress] = useState<number>(0);
    const [stepIndex, setStepIndex] = useState(0);

    const [input, setInput] = useState<AnimationRequest>({
        graph: {nodes: [], edges: []},
        densityFactor: 0.2,
        randomSeed: 0,
        timestamp: 1
    });

    const [output, setOutput] = useState<AnimationResponse>({
        ids: [getRandomId(), getRandomId(), getRandomId(), getRandomId(), getRandomId()],
        timestamp: 0
    });

    const fetchAnimation = async (input: AnimationRequest) => {
        return fetch("http://localhost:8080/ehrlichswaps/", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as AnimationResponse;
                setInput({...input, timestamp: output.timestamp});
                setOutput(output);
            });
    };

    return (
        <div className="algorithm-shell">
            {mode == "input" ?
                <SVGInput
                    setInput={setInput}
                    input={input}
                    onSubmit={() => setMode("output")}
                /> :
                <SVGOutput
                    setProgress={setProgress}
                    progress={progress}
                    setStepIndex={setStepIndex}
                    stepIndex={stepIndex}
                    output={output}
                    onChangeInput={() => setMode("input")}
                />
            }
        </div>
    )
}