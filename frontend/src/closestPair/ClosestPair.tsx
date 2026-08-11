import {useState} from "react";
import {Input} from "./input/Input.tsx";
import useClosestPairSteps from "./Api.tsx";
import type {Point, ClosestPairInputState, ClosestPairOutputState} from "./shared/Types.tsx";
import {Output} from "./output/Output.tsx";
import {decodeExportState, encodeExportState, assignLabels, getAlphabetLabel, createRandomPoints} from "../shared/Utils.tsx";
import "./App.css";
import type {AnimationRequest, ExportState} from "../shared/Types.tsx";
import {AlgorithmOverviewBox} from "../shared/AlgorithmOverviewBox.tsx";

export default function ClosestPair() {
    const [modeState, setModeState] = useState("input");
    const [inputState, setInputState] = useState<ClosestPairInputState>({points: [], timestamp: 0});  //welche points es gerade gibt
    const [outputState, setOutputState] = useState<ClosestPairOutputState>({steps: [], timestamp: -1,});
    const {loading, error, calculateSteps} = useClosestPairSteps();
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const svgHeight = 500;
    const svgWidth = 1123;


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
        setOutputState({steps: [], timestamp: -1});

        setCurrentStep(0);
        setProgress(0);
    };

    //"grundfunktion" für handleNormalSubmit und handleImport
    //bevor die points ans backend geschicket werden, werden die labels neu vergeben, um mögliche gaps zu vermeiden
    // die durch löschen von points entsehen können.
    //Der Output bekommt denselben Timestamp wie der Input, aus dem er berechnet wurde.
    const calculateOutput = async (submittedPoints: Point[], inputTimestamp: number) => {
        try {
            const labeledPoints: Point[] = assignLabels(submittedPoints);
            setInputState({points: labeledPoints, timestamp: inputTimestamp});

            const result = await calculateSteps(labeledPoints);
            //console.log("Algorithm steps:", result);
            setOutputState({steps: result, timestamp: inputTimestamp});

            //setModeState("output");
        } catch (error) {
            console.error(error);
        }
    };

    //bei normalen will man ganz normal am anfang starten...
    const handleNormalSubmit = async () => {
        const outputIsStillValid = outputState.steps.length > 0 && inputState.timestamp <= outputState.timestamp;
        if (outputIsStillValid) { //wenn input nicht neuer als output, nur zu output switchen und nicht neu berechenen und progress bleibt erhalten
            setModeState("output");
            return;
        }
        //wenn input neu/verändert bei 0 starten
        setProgress(0);
        setCurrentStep(0);

        await calculateOutput(inputState.points, inputState.timestamp);
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
            if (imported.algorithm !== "closestPair") {
                return;
            }
            const importTimestamp = Date.now();
            const importedPoints = imported.input; //assign labels wird dann in calculateOutput geamacht ...
            setProgress(imported.progress);
            await calculateOutput(importedPoints, importTimestamp);
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
            const newPoints = createRandomPoints(missingCount, PADDING, svgWidth, svgHeight);
            return {...prev, points: assignLabels([...prev.points, ...newPoints]), timestamp: Date.now()};
        });
    };

    const handlePresetChange = (input: AnimationRequest) => {
        setInputState(input as ClosestPairInputState);
    }

    if (modeState === "input") {
        return (
            <div className="algorithm-shell">
                <AlgorithmOverviewBox algoTyp={"closestPair"}/>

                <Input
                    height={svgHeight}
                    width={svgWidth}
                    mode={modeState}
                    points={inputState.points}
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
        <div className="algorithm-shell">
            <Output
                height={svgHeight}
                width={svgWidth}
                steps={outputState.steps}
                loading={loading}
                error={error}
                onChangeInput={handleChangeInput}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                progress={progress}
                setProgress={setProgress}
                createExportString={createExportString}
                onImport={handleImport}
            />
        </div>
    );
}