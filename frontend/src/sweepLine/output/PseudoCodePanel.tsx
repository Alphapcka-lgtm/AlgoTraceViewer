import type {PseudoCodeLine} from "../shared/Types.tsx";

type PseudoCodePanelProps = {
    lines: PseudoCodeLine[];
    activeLineIds: string[];
};

export function PseudoCodePanel(props: PseudoCodePanelProps) {
    return (
        <div
            style={{
                border: "2px solid black", borderRadius: "12px", padding: "10px", fontFamily: "monospace", fontSize: 14,
                backgroundColor: "rgba(250, 250, 250, 0.95)",
            }}
        >
            <div style={{fontWeight: "bold", marginBottom: 8, fontSize: 15,}}>Sweep Line Pseudocode</div>

            {props.lines.map((line) => {
                const active = props.activeLineIds.includes(line.id);

                return (
                    <div
                        key={line.id}
                        style={{
                            padding: "3px 6px",
                            paddingLeft: 6 + (line.indent ?? 0) * 24,
                            borderRadius: 6,
                            backgroundColor: active ? "rgba(255, 214, 102, 0.85)" : "transparent",
                            fontWeight: active ? "bold" : "normal",
                            transition: "background-color 0.2s ease",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {line.text}
                    </div>
                );
            })}
        </div>
    );
}

