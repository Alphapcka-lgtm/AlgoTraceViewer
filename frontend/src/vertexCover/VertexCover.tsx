import type {
    AnimationResponse,
    VertexCoverRequest,
    VertexCoverVariant,
    NavButtonProps
} from "./shared/Types.tsx";
import {decodeExportState, encodeExportState} from "../shared/Utils.tsx";
import {MaxDegreeOutput} from "./output/MaxDegreeOutput.tsx";
import {RandomOutput} from "./output/RandomOutput.tsx";
import type {CommonOutputProps, ExportState} from "../shared/Types.tsx";
import {Input} from "./input/Input.tsx";
import {useState} from "react";
import "./VertexCover.css";
import {getFormattedRequest} from "./shared/Utils.tsx";

export function VertexCover() {
    const [mode, setMode] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [variant, setVariant] = useState<VertexCoverVariant>("random");

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

    const fetchAnimation = async (input: VertexCoverRequest) => {
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
            fetchAnimation(formattedRequest)
                .then(() => {
                    setProgress(0);
                    setCurrentStepIndex(0);
                    setMode("output");
                });
        } else {
            setMode("output");
        }
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm === "vertexCover") {
                fetchAnimation({...imported.input, timestamp: Date.now()})
                    .then(() => {
                        setProgress(imported.progress);
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
        if (mode === "input") {
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
        onChangeInput: () => setMode("input"),
        createExportString: createExportString,
        onImport: handleImport
    }

    const svgOutput = variant === "random" ? (
        <RandomOutput
            output={output}
            cProps={cProps}
        />
    ) : variant === "maxDegree" || variant === "staticList" ? (
        <MaxDegreeOutput
            output={output}
            cProps={cProps}
        />
    ) : <></>;

    return (
        <>
            <nav className="home-nav vertex-cover-variant-navigation">
                <NavButton variant="random" label="Random" activeVariant={variant} onTabChange={onTabChange}/>
                <NavButton variant="maxDegree" label="Max Degree" activeVariant={variant} onTabChange={onTabChange}/>
                <NavButton variant="staticList" label="Static List" activeVariant={variant} onTabChange={onTabChange}/>
            </nav>
            <div className="algorithm-shell">
                {mode == "input" ?
                    <Input
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
            type="button"
            onClick={() => props.onTabChange(props.variant)}
            className={`home-nav-button vertex-cover-variant-button ${isActive ? "is-active" : ""}`}
        >
            {props.label}
        </button>
    );
}