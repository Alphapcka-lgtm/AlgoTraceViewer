import type {PseudoCodeLine} from "../shared/Types.tsx";

type PseudoCodePanelProps = {
    lines: PseudoCodeLine[];
    activeLineIds: string[];
};

export function PseudoCodePanel(props: PseudoCodePanelProps) {
    return (
        <div className="pseudocode-panel">
            <div className="pseudocode-title">Sweep Line Pseudocode</div>

            {props.lines.map((line) => {
                const active = props.activeLineIds.includes(line.id);

                return (
                    <div
                        key={line.id}
                        className={`pseudocode-line ${active ? "is-active" : ""}`}
                        style={{paddingLeft: 6 + (line.indent ?? 0) * 24}}
                    >
                        {line.text}
                    </div>
                );
            })}
        </div>
    );
}
