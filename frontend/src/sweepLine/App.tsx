import {useState} from "react";
import {Input} from "./input/Input.tsx";
import useSweepLineSteps from "./Api.tsx";
import type {Node, SweepLineInputState, SweepLineOutputState} from "./shared/Types.tsx";
import {Output} from "./output/Output.tsx";
import {decodeExportState, encodeExportState, assignLabels, getAlphabetLabel, createRandomNodes} from "../shared/Utils.tsx";
import "./App.css";
import {presets} from "./input/Presets.tsx";
import type {ExportState} from "../shared/Types.tsx";

export default function App() {
    const [modeState, setModeState] = useState("input"); //in welchem mode man gerade ist (output -> man kann nicht ändern)

    //const [nodes, setNodes] = useState<Node[]>([]); //welche nodes es gerade gibt
    //const [outputSteps, setOutputSteps] = useState<AlgorithmStepDTO[]>([]);
    const [inputState, setInputState] = useState<SweepLineInputState>({nodes: [], timestamp: 0});
    const [outputState, setOutputState] = useState<SweepLineOutputState>({steps: [], timestamp: -1,});

    const {loading, error, calculateSteps} = useSweepLineSteps();

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);    //für scrubber

    const [selectedPreset, setSelectedPreset] = useState("");


    const svgHeight = 500;
    const svgWidth = 1123;

    /*
    Fügt dem input state eine neue node hinzu.
    Die Lables werden sofort vergeben, sodass man die auch schon während input sieht.
    Aber Lables werden vor submit "normalisiert" mit assignLabels()...
    */
    const handleAddNode = (node: Node) => {
        setInputState(prev => {
            const labeledNode: Node = {...node, label: getAlphabetLabel(prev.nodes.length)};
            return {nodes: [...prev.nodes, labeledNode], timestamp: Date.now()};
        });
    };

    const handleMoveNode = (id: string, x: number, y: number) => {
        setInputState(prev => ({
            nodes:  prev.nodes.map((n: Node) => n.id === id ? {...n, x, y} : n),
            timestamp: Date.now()
        }));
    };

    const handleDeleteNode = (id: string) => {
        setInputState(prev => {
            const remainingNodes = prev.nodes.filter(n => n.id !== id);
            return {
                ...prev,
                nodes: assignLabels(remainingNodes),
                timestamp: Date.now()
            };
        });
    };

    const handleReset = () => {
        setInputState({nodes: [], timestamp: Date.now()});
        setOutputState({steps: [], timestamp: -1});

        setCurrentStep(0);
        setProgress(0);
    };

    //quasi die grundfunktion für handleNormalSubmit und handleImport
    //bevor die nodes ans backend geschicket werden, werden die labels neu vergeben, um mögliche gaps zu vermeiden
    // die durch löschen von nodes entsehen können.
    //Der Output bekommt denselben Timestamp wie der Input, aus dem er berechnet wurde.
    const calculateOutput = async (submittedNodes: Node[], inputTimestamp: number) => {
        try {
            const labeledNodes: Node[] = assignLabels(submittedNodes);
            setInputState({nodes: labeledNodes, timestamp: inputTimestamp});

            const result = await calculateSteps(labeledNodes);
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

        await calculateOutput(inputState.nodes, inputState.timestamp);
    };

    const handleChangeInput = () => {
        setModeState("input");
    };

    const createExportString = () => {
        return encodeExportState({algorithm: "sweepLine", input: inputState.nodes, progress});
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported: ExportState = decodeExportState(encoded);
            if (imported.algorithm !== "sweepLine") {
                return;
            }
            const importTimestamp = Date.now();
            const importedNodes = imported.input; //assign labels wird dann in calculateOutput geamacht ...
            setProgress(imported.progress);
            await calculateOutput(importedNodes, importTimestamp);
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    //Wert von Slider soll aktuelle Anzahl Nodes zeigen
    // Slider nach rechts -> zufällige Nodes hinzufügen
    // Slider nach links -> Nodes am Ende entfernen
    // Manuelles Hinzufügen oder Löschen -> Slider passt sich automatisch an
    const handleSetNodeCount = (targetCount: number) => {
        const PADDING = 80; // das nodes nichts zu sehr an rand sind
        setInputState((prev) => {
            //anzahl ist schon richitg ...
            if (targetCount === prev.nodes.length) return prev;
            //slider wurde nach links bewegt
            //wenn z.b vorher: 10 Nodes und jetzt Slider: 6 dann nur ersten 6 nodes (prev.nodes.slice(0, 6))
            if (targetCount < prev.nodes.length) {
                return {...prev, nodes: assignLabels(prev.nodes.slice(0, targetCount)), timestamp: Date.now()};
            }
            //slider nach rechts
            const missingCount:number = targetCount - prev.nodes.length;
            const newNodes = createRandomNodes(missingCount, PADDING, svgWidth, svgHeight);
            return {...prev, nodes: assignLabels([...prev.nodes, ...newNodes]), timestamp: Date.now()};
        });
    };


    const handlePresetChange = async (selected: string) => {
        setSelectedPreset(selected);
        if (selected === "random") return;
        if (selected === "-") return;
        const preset = presets.find(p => p.name === selected);
        if (!preset) return;

        await handleImport(preset.importString);
    };

    if (modeState === "input") {
        return (
            <div className="algorithm-shell">
                <Input
                    height={svgHeight}
                    width={svgWidth}
                    mode={modeState}
                    nodes={inputState.nodes}
                    onAddNode={handleAddNode}
                    onMoveNode={handleMoveNode}
                    onDeleteNode={handleDeleteNode}
                    onReset={handleReset}
                    onSubmit={handleNormalSubmit}
                    onChangeInput={handleChangeInput}
                    onImport={handleImport}

                    onSetNodeCount={handleSetNodeCount}

                    selectedPreset={selectedPreset}
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