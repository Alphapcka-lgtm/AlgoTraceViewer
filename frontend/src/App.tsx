import {useState} from "react";
import { SVGInput } from "./SVGInput";
import useSweepLineSteps from "./Api.tsx";
import type {AlgorithmStepDTO, Node} from "./Types";
//import {SVGOutput} from "./SVGOutput";
import {SVGOutput2} from "./SVGOutput2.tsx";
import {getAlphabetLabel} from "./Utils.tsx";

export default function App() {
    const [modeState, setModeState] = useState("input"); //in welchem mode man gerade ist (output -> man kann nicht ändern)
    const [nodes, setNodes] = useState<Node[]>([]); //welche nodes es gerade gibt

    const [outputSteps, setOutputSteps] = useState<AlgorithmStepDTO[]>([]);

    //const {algoSteps, loading, error, calculateSteps} = useSweepLineSteps();
    const {loading, error, calculateSteps} = useSweepLineSteps();

    const [nextLabelIndex, setNextLabelIndex] = useState(0);

    const svgHeight = 500;
    const svgWidth = 1123;

    /*
    const handleAddNode = (node: Node) => {
        setNodes((prev : Node[])=> [...prev, node]);
    };
     */

    const handleAddNode = (node: Omit<Node, "label">) => {
        const label:string = getAlphabetLabel(nextLabelIndex);
        const newNode: Node = {...node, label};
        setNodes((prev:Node[]) => [...prev, newNode]);
        setNextLabelIndex((prev:number) => prev + 1);
    };

    const handleMoveNode = (id: string, x: number, y: number) => {
        setNodes((prev : Node[]) =>
            prev.map((n : Node) => n.id === id ? { ...n, x, y } : n)
        );
    };

    const handleDeleteNode = (id: string) => {
        setNodes((prev : Node[]) => prev.filter(n => n.id !== id));
    };

    const handleReset = () => {
        setNodes([]);
        setOutputSteps([]);
        setNextLabelIndex(0);
    };

    /*
    const handleSubmit = async (submittedNodes: Node[]) => {
        //console.log("Submitted:", submittedNodes);
        try {
            const result = await calculateSteps(submittedNodes);
            setModeState("output");
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    };
    */

    const handleSubmit = async (submittedNodes: Node[]) => {
        try {
            const result = await calculateSteps(submittedNodes);

            console.log("Algorithm steps:", result);

            setOutputSteps(result);
            setModeState("output");
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeInput = () => {
        setModeState("input");
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

                onSubmit={handleSubmit}
                onChangeInput={handleChangeInput}
            />
        );
    }

    return (
        <SVGOutput2
            height={svgHeight}
            width={svgWidth}
            steps={outputSteps}
            loading={loading}
            error={error}
            onChangeInput={handleChangeInput}
        />
    );

}

