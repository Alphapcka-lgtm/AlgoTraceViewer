import {SVGOutput} from "./output/SVGOutput.tsx";
import {SVGInput} from "./input/SVGInput.tsx";
import {useState} from "react";

import type {AnimationResponse, AnimationRequest} from "./shared/Types.tsx";
import {decodeExportState, encodeExportState} from "../../sweepLine/shared/Utils.tsx";
import type {ExportState} from "../../sweepLine/shared/Types.tsx";
import {getNodeLabel} from "../random/shared/Utils.tsx";

export function MaxDegreeVertexCover() {
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
        initialDegreeMap: [],
        intermediateStates: [],
        randomSeed: 0,
        timestamp: 0
    });

    const submitInput = (inp: AnimationRequest) => {
        console.log(inp);
        if (inp.timestamp > output.timestamp) {
            const labeledInp = {...inp, graph: {nodes: inp.graph.nodes.map((node, index) => {
                        return {...node, label: getNodeLabel(index)};
                    }), edges: inp.graph.edges}};
            fetchAnimation(labeledInp)
                .then(() => {
                    setProgress(0);
                    setStepIndex(0);
                    setMode("output");
                });
        } else {
            setMode("output");
        }
    };

    const fetchAnimation = async (input: AnimationRequest) => {
        return fetch("http://localhost:8080/vertexcover/heuristic", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                console.log(json);
                const output = json as AnimationResponse;
                console.log(output);
                setInput({...input, timestamp: output.timestamp});
                setOutput(output);
            });
    };

    const submitCurrentInput = () => submitInput(input);

    const handleImport = async (encoded: string) => {
        try {
            const imported:ExportState = decodeExportState(encoded);
            if (imported.algorithm === "randomVertexCover" || imported.algorithm === "heuristicVertexCover") {
                fetchAnimation(imported.input)
                    .then(() => {
                        setProgress(imported.progress);
                    });
            }
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    const createExportString = () => encodeExportState({algorithm: "heuristicVertexCover", progress, input});

    return (
        <div className="algorithm-shell">
            {mode == "input" ?
                <SVGInput
                    setInput={setInput}
                    input={input}
                    onSubmit={submitCurrentInput}
                    createExportString={createExportString}
                    onImport={handleImport}
                /> :
                <SVGOutput
                    setProgress={setProgress}
                    progress={progress}
                    setStepIndex={setStepIndex}
                    stepIndex={stepIndex}
                    output={output}
                    onChangeInput={() => setMode("input")}
                    createExportString={createExportString}
                />
            }
        </div>
    )
}