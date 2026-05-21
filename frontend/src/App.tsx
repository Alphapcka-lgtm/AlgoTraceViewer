import {useState} from "react";
import {SVGInput} from "./SVGInput";
import useSweepLineSteps from "./Api.tsx";
import type {AlgorithmStepDTO, ExportState, Node} from "./Types";
//import {SVGOutput} from "./SVGOutput";
//import {SVGOutput2} from "./SVGOutput2.tsx";
import {SVGOutput4} from "./SVGOutput4.tsx";
import {decodeExportState, encodeExportState, getAlphabetLabel} from "./Utils.tsx";

export default function App() {
    const [modeState, setModeState] = useState("input"); //in welchem mode man gerade ist (output -> man kann nicht ändern)
    const [nodes, setNodes] = useState<Node[]>([]); //welche nodes es gerade gibt

    const [outputSteps, setOutputSteps] = useState<AlgorithmStepDTO[]>([]);

    //const {algoSteps, loading, error, calculateSteps} = useSweepLineSteps();
    const {loading, error, calculateSteps} = useSweepLineSteps();

    const [nextLabelIndex, setNextLabelIndex] = useState(0);

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);    //für scrubber

    const svgHeight = 500;
    const svgWidth = 1123;

    /*
    const handleAddNode = (node: Node) => {
        setNodes((prev : Node[])=> [...prev, node]);
    };
     */

    const handleAddNode = (node: Omit<Node, "label">) => {
        const label: string = getAlphabetLabel(nextLabelIndex);
        const newNode: Node = {...node, label};
        setNodes((prev: Node[]) => [...prev, newNode]);
        setNextLabelIndex((prev: number) => prev + 1);
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
        setNextLabelIndex(0);

        setCurrentStep(0);
        setProgress(0);
    };

    //quasi die grundfunktion für handleNormalSubmit und handleImport
    const handleSubmit = async (submittedNodes: Node[]) => {
        try {
            const result = await calculateSteps(submittedNodes);
            //console.log("Algorithm steps:", result);
            setOutputSteps(result);
            setModeState("output");
        } catch (error) {
            console.error(error);
        }
    };

    //bei normalen will man ganz normal am anfang starten...
    const handleNormalSubmit = async (submittedNodes: Node[]) => {
        setProgress(0);
        setCurrentStep(0);

        await handleSubmit(submittedNodes);
    };

    const handleChangeInput = () => {
        setModeState("input");
    };

    const createExportString = () => {
        return encodeExportState({nodes, progress, stepIndex: currentStep});
    };

    const handleImport = async (encoded: string) => {
        try {
            const imported:ExportState = decodeExportState(encoded);

            setNodes(imported.nodes);
            // Damit neue Punkte nach dem Import kein bereits vergebenes Label bekommen
            setNextLabelIndex(imported.nodes.length); // TODO: z. B. wenn importierte Labels A, C, Z, wäre nodes.length nicht wirklich richitg ...
            setProgress(imported.progress);
            setCurrentStep(imported.stepIndex);

            await handleSubmit(imported.nodes);
        } catch (error) {
            console.error("Invalid import string", error);
        }
    };

    if (modeState === "input") {
        return (
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
        );
    }

    return (
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
    );

}

