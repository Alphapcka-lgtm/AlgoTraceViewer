import {useState} from "react";
import { SVGInput } from "./SVGInput";
import useSweepLineSteps from "./Api.tsx";
import type {Node} from "./Types";

export default function App() {
    const [modeState, setModeState] = useState("input"); //in welchem mode man gerade ist (output -> man kann nicht ändern)
    const [nodes, setNodes] = useState<Node[]>([]); //welche nodes es gerade gibt
    //const {algoSteps, loading, error, calculateSteps} = useSweepLineSteps();
    const {calculateSteps} = useSweepLineSteps();


    const svgHeight = 500;
    const svgWidth = 1123;

    const handleAddNode = (node: Node) => {
        setNodes((prev : Node[])=> [...prev, node]);
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
    };

    const handleSubmit = async () => {
        console.log("Submitted:", nodes);
        setModeState("output");

        try {
            const result = await calculateSteps(nodes);
            console.log(result);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChangeInput = () => {
        setModeState("input");
    };

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

