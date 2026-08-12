import {useState} from "react";
import {Input} from "./input/Input.tsx";
import type {Point, ClosestPairInputState, ClosestPairOutputState} from "./shared/Types.tsx";
import {Output} from "./output/Output.tsx";
import {
    decodeExportState,
    encodeExportState,
    assignLabels,
    getAlphabetLabel,
    createRandomPoints,
    SVG_WIDTH, SVG_HEIGHT
} from "../shared/Utils.tsx";
import "./ClosestPair.css";
import type {AnimationRequest, ExportState} from "../shared/Types.tsx";
import {AlgorithmOverviewBox} from "../shared/AlgorithmOverviewBox.tsx";
import {getClosestPairSteps} from "./Api.tsx";

export default function ClosestPair() {
    const [modeState, setModeState] = useState("input");
    const [inputState, setInputState] = useState<ClosestPairInputState>({points: [], timestamp: 0});  //welche points es gerade gibt
    const [outputState, setOutputState] = useState<ClosestPairOutputState>({steps: [], timestamp: 0});
    const [loading, setLoading] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    //Die Lables werden sofort vergeben, sodass man die auch schon während input sieht.
    const handleAddPoint = (point: Point) => {
        setInputState(prev => {
            const labeledPoint: Point = {...point, label: getAlphabetLabel(prev.points.length)};
            return {points: [...prev.points, labeledPoint], timestamp: Date.now()};
        });
    };

    const handleMovePoint = (id: string, x: number, y: number) => {
        setInputState(prev => ({
            points:  prev.points.map((n: Point) => n.id === id ? {...n, x, y} : n),
            timestamp: Date.now()
        }));
    };

    const handleDeletePoint = (id: string) => {
        setInputState(prev => {
            const remainingPoints = prev.points.filter(n => n.id !== id);
            return {...prev, points: assignLabels(remainingPoints), timestamp: Date.now()};
        });
    };

    const handleReset = () => {
        setInputState({points: [], timestamp: Date.now()});
        setOutputState({steps: [], timestamp: Date.now()});
        setCurrentStepIndex(0);
        setProgress(0);
    };

    //"grundfunktion" für handleNormalSubmit und handleImport
    //bevor die points ans backend geschicket werden, werden die labels neu vergeben, um mögliche gaps zu vermeiden
    // die durch löschen von points entsehen können.
    //Der Output bekommt denselben Timestamp wie der Input, aus dem er berechnet wurde.
    const calculateOutput = async (submittedPoints: Point[]) => {
        const labeledPoints = assignLabels(submittedPoints);
        setInputState(prev => ({...prev, points: labeledPoints}));
        setLoading(true);
        try {
            const steps = await getClosestPairSteps(labeledPoints);
            setOutputState({steps, timestamp: Date.now()});
        } finally {
            setLoading(false);
        }
    };

    //bei normalen will man ganz normal am anfang starten...
    const handleNormalSubmit = () => {
        if (inputState.timestamp < outputState.timestamp) {//wenn input nicht neuer als output, nur zu output switchen und nicht neu berechenen und progress bleibt erhalten
            setModeState("output");
            return;
        }
        //wenn input neu/verändert bei 0 starten
        setProgress(0);
        setCurrentStepIndex(0);
        calculateOutput(inputState.points).then(() => setModeState("output"));
    };

    const handleChangeInput = () => {
        setModeState("input");
    };

    const createExportString = () => {
        return encodeExportState({algorithm: "closestPair", input: inputState.points, progress});
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm !== "closestPair") return;
            setProgress(imported.progress);
            await calculateOutput(imported.input);//assign labels wird dann in calculateOutput geamacht ...
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    //Wert von Slider soll aktuelle Anzahl Points zeigen
    // Slider nach rechts -> zufällige Points hinzufügen
    // Slider nach links -> Points am Ende entfernen
    // Manuelles Hinzufügen oder Löschen -> Slider passt sich automatisch an
    const handleSetPointCount = (targetCount: number) => {
        const PADDING = 80; // das points nichts zu sehr an rand sind
        setInputState((prev) => {
            //anzahl ist schon richitg ...
            if (targetCount === prev.points.length) return prev;
            //slider wurde nach links bewegt
            //wenn z.b vorher: 10 Points und jetzt Slider: 6 dann nur ersten 6 points (prev.points.slice(0, 6))
            if (targetCount < prev.points.length) {
                return {...prev, points: assignLabels(prev.points.slice(0, targetCount)), timestamp: Date.now()};
            }
            //slider nach rechts
            const missingCount:number = targetCount - prev.points.length;
            const newPoints = createRandomPoints(missingCount, PADDING, SVG_WIDTH, SVG_HEIGHT);
            return {...prev, points: assignLabels([...prev.points, ...newPoints]), timestamp: Date.now()};
        });
    };

    const handlePresetChange = (input: AnimationRequest) => {
        const myInput =  input as ClosestPairInputState;
        setInputState({...myInput, timestamp: Date.now()});
    }

    if (modeState === "input") {
        return (
            <div className={`algorithm-shell ${loading ? "is-loading" : ""}`}>
                <AlgorithmOverviewBox algoTyp={"closestPair"}/>

                <Input
                    mode={modeState}
                    inputState={inputState}
                    onAddPoint={handleAddPoint}
                    onMovePoint={handleMovePoint}
                    onDeletePoint={handleDeletePoint}
                    onReset={handleReset}
                    onSubmit={handleNormalSubmit}
                    onChangeInput={handleChangeInput}
                    onImport={handleImport}
                    onSetPointCount={handleSetPointCount}
                    onPresetChange={handlePresetChange}
                    createExportString={createExportString}
                />
            </div>
        );
    }

    return (
        <div className={`algorithm-shell ${loading ? "is-loading" : ""}`}>
            <Output
                steps={outputState.steps}
                progress={progress}
                setProgress={setProgress}
                currentStepIndex={currentStepIndex}
                setCurrentStepIndex={setCurrentStepIndex}
                onChangeInput={handleChangeInput}
                createExportString={createExportString}
                onImport={handleImport}
            />
        </div>
    );
}