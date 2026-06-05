import {useState} from "react";
import {SVGInput} from "./input/SVGInput.tsx";
import useSweepLineSteps from "./Api.tsx";
import type {AlgorithmStepDTO, ExportState, Node} from "./shared/Types.tsx";
import {SVGOutput4} from "./output/SVGOutput4.tsx";
import {decodeExportState, encodeExportState, assignLabels, getAlphabetLabel} from "./shared/Utils.tsx";
import "./App.css";

export default function App() {
    const [modeState, setModeState] = useState("input"); //in welchem mode man gerade ist (output -> man kann nicht ändern)
    const [nodes, setNodes] = useState<Node[]>([]); //welche nodes es gerade gibt

    const [outputSteps, setOutputSteps] = useState<AlgorithmStepDTO[]>([]);

    const {loading, error, calculateSteps} = useSweepLineSteps();

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);    //für scrubber

    const svgHeight = 500;
    const svgWidth = 1123;

    /*
    Fügt dem input state eine neue node hinzu.
    Die Lables werden sofort vergeben, sodass man die auch schon während input sieht.
    Aber Lables werden vor submit "normalisiert" mit assignLabels()...
    */
    const handleAddNode = (node: Node) => {
        setNodes((prev) => {
            const labeledNode: Node = {...node, label: getAlphabetLabel(prev.length)};
            return [...prev, labeledNode];
        });
    };

    const handleMoveNode = (id: string, x: number, y: number) => {
        setNodes((prev: Node[]) =>
            prev.map((n: Node) => n.id === id ? {...n, x, y} : n)
        );
    };

    const handleDeleteNode = (id: string) => {
        setNodes((prev: Node[]) => prev.filter(n => n.id !== id));
    };

    const handleReset = () => {
        setNodes([]);
        setOutputSteps([]);

        setCurrentStep(0);
        setProgress(0);
    };

    //quasi die grundfunktion für handleNormalSubmit und handleImport
    //bevor die nodes ans backend geschicket werden, werden die labels neu vergeben, um mögliche gaps zu vermeiden
    // die durch löschen von nodes entsehen können.
    const handleSubmit = async (submittedNodes: Node[]) => {
        try {
            const labeledNodes:Node[] = assignLabels(submittedNodes);
            setNodes(labeledNodes);

            const result = await calculateSteps(labeledNodes);
            //console.log("Algorithm steps:", result);
            setOutputSteps(result);
            setModeState("output");
        } catch (error) {
            console.error(error);
        }
    };

    //bei normalen will man ganz normal am anfang starten...
    const handleNormalSubmit = async () => {
        setProgress(0);
        setCurrentStep(0);

        await handleSubmit(nodes);
    };

    const handleChangeInput = () => {
        setModeState("input");
    };

    const createExportString = () => {
        return encodeExportState({algorithm: "sweepLine", input: nodes, progress});
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported:ExportState = decodeExportState(encoded);
            if (imported.algorithm === "sweepLine") {
                setNodes(imported.input);
                setProgress(imported.progress);
                await handleSubmit(imported.input);
            }
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    if (modeState === "input") {
        return (
            <div className="algorithm-shell">
                <SVGInput
                    height={svgHeight}
                    width={svgWidth}
                    mode={modeState}
                    nodes={nodes}
                    onAddNode={handleAddNode}
                    onMoveNode={handleMoveNode}
                    onDeleteNode={handleDeleteNode}
                    onReset={handleReset}
                    onSubmit={handleNormalSubmit}
                    onChangeInput={handleChangeInput}
                    onImport={handleImport}
                />
            </div>
        );
    }

    return (
        <div className="algorithm-shell">
            <SVGOutput4
                height={svgHeight}
                width={svgWidth}
                steps={outputSteps}
                loading={loading}
                error={error}
                onChangeInput={handleChangeInput}
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                progress={progress}
                setProgress={setProgress}
                createExportString={createExportString}
            />
        </div>
    );
}