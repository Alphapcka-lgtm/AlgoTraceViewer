import {useState} from "react";
import {SaisInput} from "./input/SaisInput.tsx";
import type {SaisRequestDto, SaisResponseDto, StepInfo} from "./shared/Types.tsx";
import {SaisOutput} from "./output/SaisOutput.tsx";
import "./SuffixArrayInducedSorting.css"
import type {ExportState} from "../shared/Types.tsx";
import {decodeExportState, encodeExportState} from "../shared/Utils.tsx";

export default function SuffixArrayInducedSorting() {
    const [mode, setModeState] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [activeLineIds, setActiveLineIds] = useState(["word"]);
    const [stepDescription, setStepDescription] = useState<StepInfo>({title: "", description: ""});
    const [input, setInput] = useState<SaisRequestDto>({
        source: "",
        timestamp: 0,
    });
    const [output, setOutput] = useState<SaisResponseDto>({
        source: "",
        bucketSizes: [],
        typeMapDto: {map: [], lmsCount: 0,},
        guessLmsSteps: [],
        guessInduceL: [],
        guessInduceS: [],
        guessedSa: [],
        lmsOrder: [],
        lmsNames: [],
        lmsPositions: [],
        reduced: [],
        reducedSorted: [],
        lmsSortSteps: [],
        saLmsAdded: [],
        saInduceL: [],
        saInduceS: [],
        sa: [],
        timestamp: -1,
    });

    const svgHeight = 500;
    const svgWidth = 1123;

    const handleSubmit = async () => {
        if (input.timestamp > output.timestamp) {
            fetchSais(input)
                .then(() => {
                    setProgress(0);
                    setCurrentStepIndex(0);
                    setModeState("output");
                })
                .catch((error) => alert(error));
        } else {
            setModeState("output");
        }
    }

    const fetchSais = async (input: SaisRequestDto) => {
        return fetch("http://localhost:8080/sais", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(input),
        })
            .then((response) => response.json())
            .then((json) => {
                const output = json as SaisResponseDto;
                const ts = Date.now()
                output.timestamp = ts
                setInput({...input, timestamp: ts})
                setOutput(output);
            });
    }

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm === "sais") {
                fetchSais(({...imported.input, timestamp: Date.now()}))
                    .then(() => {
                        setProgress(imported.progress);
                        setModeState("output");
                    });
            }
        } catch (error) {
            console.error("Invalid import string", error);
        }
    }

    const createExportString = () => {
        return encodeExportState({algorithm: "sais", input: input, progress: progress});
    }

    const handleChangeInput = () => {
        setModeState("input")
    }

    const updateValue = (newValue: string) => {
        // validate input
        if (/^[a-z]*$/.test(newValue) && newValue.length < 15) {
            setInput({source: newValue, timestamp: Date.now()});
        }
    }

    const canSubmit = () => input.source.trim() !== "";

    if (mode === "input") {
        return (
            <>
                <div className="algorithm-shell">
                    <SaisInput height={svgHeight}
                               width={svgWidth}
                               onSubmit={handleSubmit}
                               onChangeInput={handleChangeInput}
                               value={input.source}
                               onUpdateValue={updateValue}
                               onImport={handleImport}
                               createExportString={createExportString}
                               setInput={setInput}
                               canSubmit={canSubmit()}
                    />
                </div>
            </>
        );
    }

    return (
        <div className="algorithm-shell">

            <SaisOutput
                output={output}
                activeLineIds={activeLineIds}
                setActiveLineIds={setActiveLineIds}
                stepDescription={stepDescription}
                setStepDescription={setStepDescription}
                cProps = {{
                    progress: progress,
                    setProgress: setProgress,
                    currentStepIndex: currentStepIndex,
                    setCurrentStepIndex: setCurrentStepIndex,
                    onChangeInput: handleChangeInput,
                    createExportString: createExportString,
                    onImport: handleImport
                }}
            />
        </div>
    );
}