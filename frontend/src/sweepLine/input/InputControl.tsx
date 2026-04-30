import type { InputControlProps } from "./Types.tsx";

export function InputControl(props: InputControlProps ) {

    const resetInput = () => {
        props.setInput((input) => {
            return { ...input, graph: { nodes: [], edges: [] }, timestamp: Date.now() };
        });
        props.setInteraction({ type: "idle" });
    };

    return <div style={ { display: "flex", flexDirection: "column", gap: 3 } } >
        <button onClick={ resetInput } style={ { flex: 1, border: "2px solid black", borderRadius: "30px" } } >Reset</button>
    </div>;
}