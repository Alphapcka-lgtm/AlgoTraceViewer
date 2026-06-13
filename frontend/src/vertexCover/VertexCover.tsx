import type {AnimationRequest, AnimationResponse, NavButtonProps, VertexCoverVariant} from "./shared/Types.tsx";
import {assignLabels, decodeExportState, encodeExportState} from "../shared/Utils.tsx";
import {MaxDegreeSVGOutput} from "./output/MaxDegreeSVGOutput.tsx";
import {RandomSVGOutput} from "./output/RandomSVGOutput.tsx";
import type {ExportState} from "../shared/Types.tsx";
import {SVGInput} from "./input/SVGInput.tsx";
import {useState} from "react";

export function VertexCover() {
    const [mode, setMode] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [stepIndex, setStepIndex] = useState(0);
    const [variant, setVariant] = useState<VertexCoverVariant>("random");

    const [input, setInput] = useState<AnimationRequest>({
        graph: {nodes: [], edges: []},
        densityFactor: 0.2,
        preset: "custom",
        randomSeed: 0,
        timestamp: 0
    });

    const [output, setOutput] = useState<AnimationResponse>({
        initialState: {nodes: [], edges: []},
        intermediateStates: [],
        initialDegreeMap: [],
        randomSeed: 0,
        timestamp: 0
    });

    const submitInput = (inp: AnimationRequest) => {
        if (inp.timestamp > output.timestamp) {
            const labeledInp = {...inp, graph: {nodes: assignLabels(inp.graph.nodes), edges: inp.graph.edges}};
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
        return fetch("http://localhost:8080/vertexCover/" + variant, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as AnimationResponse;
                setInput({...input, randomSeed: output.randomSeed, timestamp: output.timestamp});
                setOutput(output);
            });
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm === "vertexCover") {
                fetchAnimation(imported.input)
                    .then(() => {
                        setProgress(imported.progress);
                    });
            }
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    const createExportString = () => {
        const labeledInp = {...input, graph: {nodes: assignLabels(input.graph.nodes), edges: input.graph.edges}};
        return encodeExportState({algorithm: "vertexCover", input: labeledInp, progress});
    };

    const onTabChange = (v: VertexCoverVariant) => {
        if (mode === "input") {
            setInput(prev => {
                return {...prev, timestamp: Date.now()};
            })
            setVariant(v);
        }
    }

    const svgOutput = variant === "random" ? (
        <RandomSVGOutput
            setProgress={setProgress}
            progress={progress}
            setStepIndex={setStepIndex}
            stepIndex={stepIndex}
            output={output}
            onChangeInput={() => setMode("input")}
            createExportString={createExportString}
            onImport={handleImport}
        />
    ) : variant === "maxDegree" ? (
        <MaxDegreeSVGOutput
            setProgress={setProgress}
            progress={progress}
            setStepIndex={setStepIndex}
            stepIndex={stepIndex}
            output={output}
            onChangeInput={() => setMode("input")}
            createExportString={createExportString}
            onImport={handleImport}
        />
    ) : <></>;

    return (
        <>
            <nav className="home-nav" style={{
                padding: "0.25rem",
                width: "fit-content",
                marginLeft: "auto",
                marginRight: "3rem",
                marginBottom: "2rem"
            }}>
                <NavButton variant="random" label="Random" activeVariant={variant} onTabChange={onTabChange}/>
                <NavButton variant="maxDegree" label="Max Degree" activeVariant={variant} onTabChange={onTabChange}/>
                <NavButton variant="staticList" label="Static List" activeVariant={variant} onTabChange={onTabChange}/>
            </nav>
            <div className="algorithm-shell">
                {mode == "input" ?
                    <SVGInput
                        setInput={setInput}
                        input={input}
                        onSubmit={submitInput}
                        createExportString={createExportString}
                        onImport={handleImport}
                    /> : svgOutput
                }
            </div>
        </>
    )
}

function NavButton(props: NavButtonProps) {
    const isActive = props.activeVariant === props.variant;

    return (
        <button
            style={{padding: "0.5rem 1.5rem", fontSize: "1rem"}}
            type="button"
            onClick={() => props.onTabChange(props.variant)}
            className={`home-nav-button ${isActive ? "is-active" : ""}`}
        >
            {props.label}
        </button>
    );
}