import {useState} from "react";
import {SaisInput} from "./input/SaisInput.tsx";
import type {SaisRequestDto, SaisResponseDto, StepInfo} from "./shared/Types.tsx";
import {SaisOutput} from "./output/SaisOutput.tsx";
import "./SuffixArrayInducedSorting.css"

export default function SuffixArrayInducedSorting() {
    const [mode, setModeState] = useState<"input" | "output">("input");
    const [progress, setProgress] = useState<number>(0);
    const [stepIndex, setStepIndex] = useState(0);
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
        console.log("SuffixArrayInducedSorting.handleSubmit");
        console.log("input: ", input);
        if (input.timestamp > output.timestamp) {
            console.log("fetching")
            fetchSais(input).then(() => {
                setProgress(0);
                setStepIndex(0);
                setModeState("output");
            })
        } else {
            setModeState("output")
        }
    }

    const fetchSais = async (input: SaisRequestDto) => {
        fetch("http://localhost:8080/sais", {
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

    const handleChangeInput = () => {
        setModeState("input")
    }

    const updateValue = (newValue: string) => {
        // validate input
        if (/^[a-z]*$/.test(newValue) && newValue.length < 15) {
            setInput({source: newValue, timestamp: Date.now()});
        }
    }

    if (mode === "input") {
        return (
            <div className="algorithm-shell">
                <SaisInput height={svgHeight}
                           width={svgWidth}
                           onSubmit={handleSubmit}
                           onChangeInput={handleChangeInput}
                           value={input.source}
                           onUpdateValue={updateValue}
                />
                <p>immissiissippi</p>
                <p>banana</p>
            </div>
        );
    }

    return (
        <div className="algorithm-shell">
            <SaisOutput output={output}
                        progress={progress}
                        setProgress={setProgress}
                        stepIndex={stepIndex}
                        setStepIndex={setStepIndex}
                        activeLineIds={activeLineIds}
                        setActiveLineIds={setActiveLineIds}
                        stepDescription={stepDescription}
                        setStepDescription={setStepDescription}
                        onChangeInput={handleChangeInput}
                        createExportString={() => "" /*TODO*/}
                        onImport={encoded => console.log("import: " + encoded) /*TODO*/}
            />
        </div>
    );
}