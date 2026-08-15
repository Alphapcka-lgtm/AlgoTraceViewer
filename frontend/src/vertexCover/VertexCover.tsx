import type {
    AnimationResponse,
    VertexCoverRequest,
    VertexCoverVariant,
} from "./shared/Types.tsx";
import {decodeExportState, encodeExportState} from "../shared/Utils.tsx";
import {MaxDegreeOutput} from "./output/MaxDegreeOutput.tsx";
import {RandomOutput} from "./output/RandomOutput.tsx";
import type {CommonOutputProps, ExportState} from "../shared/Types.tsx";
import {Input} from "./input/Input.tsx";
import {useState} from "react";
import "./VertexCover.css";
import {getFormattedRequest} from "./shared/Utils.tsx";
import {AlgorithmOverviewBox} from "../shared/AlgorithmOverviewBox.tsx";
import {VariantNavigation} from "./shared/VariantNavigation.tsx";

export function VertexCover() {
    const [modeState, setModeState] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [variant, setVariant] = useState<VertexCoverVariant>("random");
    const [densityFactor, setDensityFactor] = useState<number>(0);

    const [input, setInput] = useState<VertexCoverRequest>({
        graph: {nodes: [], edges: []},
        nodeOrder: [],
        edgeOrder: [],
        timestamp: 0
    });

    const [output, setOutput] = useState<AnimationResponse>({
        initialState: {nodes: [], edges: []},
        intermediateStates: [],
        initialDegreeMap: [],
        timestamp: 0
    });

    const fetchIntermediateAlgorithmStates = async (input: VertexCoverRequest) => {
        return fetch("http://localhost:8080/api/vertexCover/" + variant, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as AnimationResponse;
                setOutput(output);
                setInput(input);
            });
    };

    const submitInput = (inp: VertexCoverRequest) => {
        if (inp.timestamp > output.timestamp) {
            const formattedRequest = getFormattedRequest(inp);
            fetchIntermediateAlgorithmStates(formattedRequest)
                .then(() => {
                    setProgress(0);
                    setCurrentStepIndex(0);
                    setModeState("output");
                });
        } else {
            setModeState("output");
        }
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm === "vertexCover") {
                fetchIntermediateAlgorithmStates({...imported.input, timestamp: Date.now()})
                    .then(() => {
                        setProgress(imported.progress);
                        setModeState("output");
                    });
            }
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    const createExportString = () => {
        const formattedRequest = getFormattedRequest(input);
        return encodeExportState({algorithm: "vertexCover", input: formattedRequest, progress});
    };

    const onTabChange = (v: VertexCoverVariant) => {
        if (modeState === "input") {
            setInput(prev => {
                return {...prev, timestamp: Date.now()};
            })
            setVariant(v);
        }
    }

    const cProps: CommonOutputProps = {
        progress: progress,
        setProgress: setProgress,
        currentStepIndex: currentStepIndex,
        setCurrentStepIndex: setCurrentStepIndex,
        onChangeInput: () => setModeState("input"),
        createExportString: createExportString,
        onImport: handleImport
    }

    const svgOutput = variant === "random" ? (
        <RandomOutput
            output={output}
            variant={variant}
            cProps={cProps}
        />
    ) : variant === "maxDegree" || variant === "staticList" ? (
        <MaxDegreeOutput
            output={output}
            variant={variant}
            cProps={cProps}
        />
    ) : <></>;

    return (
        <>
            <div className="algorithm-shell">
                {modeState == "input" ? (
                    <>
                        <AlgorithmOverviewBox
                            algoTyp={"vertexCover"}
                        />
                        <VariantNavigation
                            variant={variant}
                            disabled={false}
                            onTabChange={onTabChange}
                        />
                        <Input
                            setInput={setInput}
                            input={input}
                            setDensityFactor={setDensityFactor}
                            densityFactor={densityFactor}
                            onSubmit={submitInput}
                            createExportString={createExportString}
                            onImport={handleImport}
                        />
                    </>
                ) : (
                    <>
                        <VariantNavigation
                            variant={variant}
                            disabled={true}
                            onTabChange={onTabChange}
                        />
                        {svgOutput}
                    </>
                )}
            </div>
        </>
    )
}