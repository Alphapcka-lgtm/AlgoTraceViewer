import type {PseudoCodePanelProps} from "./Types.tsx";

export function PseudoCodePanel(props: PseudoCodePanelProps) {
    return (
        <div className="pseudocode-panel">
            {props.lines.map((line) => {
                const active = props.activeLineIds.includes(line.id);

                return (
                    <div
                        key={line.id}
                        className={`pseudocode-line ${line.indent ? `pseudocode-line--indent-${line.indent}` : ""} ${active ? "is-active" : ""}`}
                    >
                        {line.text}
                    </div>
                );
            })}
        </div>
    );
}
